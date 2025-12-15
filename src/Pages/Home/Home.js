import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container, Row, Col } from "react-bootstrap";
// import loading from "../../assets/loader.gif";
import "./home.css";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import Analytics from "./Analytics";

const Home = () => {
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };
  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");

  const handleStartChange = (date) => {
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const avatarFunc = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log(user);

        if (user.isAvatarImageSet === false || user.avatarImage === "") {
          navigate("/setAvatar");
        }
        setcUser(user);
        setRefresh(true);
      } else {
        navigate("/login");
      }
    };

    avatarFunc();
  }, [navigate]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChangeFrequency = (e) => {
    setFrequency(e.target.value);
  };

  const handleSetType = (e) => {
    setType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, amount, description, category, date, transactionType } =
      values;

    if (
      !title ||
      !amount ||
      !description ||
      !category ||
      !date ||
      !transactionType
    ) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }
    setLoading(true);

    try {
      const userId = cUser._id || cUser.id;
      
      try {
        // Try JSON-Server first
        const { data } = await axios.post(addTransaction, {
          title: title,
          amount: amount,
          description: description,
          category: category,
          date: date,
          transactionType: transactionType,
          userId: userId,
        });

        if (data && (data.success === true || data.id)) {
          toast.success("Transaction added successfully!", toastOptions);
          handleClose();
          setRefresh(!refresh);
          // Also update localStorage for consistency
          try {
            const allTransactions = JSON.parse(localStorage.getItem("appTransactions") || "[]");
            const newTransaction = {
              _id: data.id || Date.now(),
              id: data.id || Date.now(),
              title: title,
              amount: parseFloat(amount),
              description: description,
              category: category,
              date: date,
              transactionType: transactionType,
              userId: userId,
            };
            allTransactions.push(newTransaction);
            localStorage.setItem("appTransactions", JSON.stringify(allTransactions));
          } catch (e) {
            console.log("Could not update localStorage:", e);
          }
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent("transactionsUpdated"));
          setValues({
            title: "",
            amount: "",
            description: "",
            category: "",
            date: "",
            transactionType: "",
          });
        }
      } catch (err) {
        // Fallback to localStorage
        const allTransactions = JSON.parse(localStorage.getItem("appTransactions") || "[]");
        
        const newTransaction = {
          _id: Date.now(),
          id: Date.now(),
          title: title,
          amount: parseFloat(amount),
          description: description,
          category: category,
          date: date,
          transactionType: transactionType,
          userId: userId,
        };

        allTransactions.push(newTransaction);
        localStorage.setItem("appTransactions", JSON.stringify(allTransactions));
        
        toast.success("Transaction added successfully!", toastOptions);
        handleClose();
        setRefresh(!refresh);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent("transactionsUpdated"));
        setValues({
          title: "",
          amount: "",
          description: "",
          category: "",
          date: "",
          transactionType: "",
        });
      }
    } catch (error) {
      toast.error("Error adding transaction", toastOptions);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
  };

  // derive filtered transactions based on selected filters
  const getFilteredTransactions = () => {
    if (!transactions || transactions.length === 0) return [];

    return transactions.filter((t) => {
      // type filter
      if (type && type !== "all") {
        const tt = (t.transactionType || t.type || "").toString().toLowerCase();
        if (type === "expense" && tt !== "expense") return false;
        if (type === "credit" && tt !== "credit") return false;
      }

      // date filter
      const txDate = t.date ? (typeof t.date === 'string' ? new Date(t.date) : t.date) : null;
      if (!txDate) return false;

      if (frequency && frequency !== "custom") {
        const days = parseInt(frequency, 10);
        if (!isNaN(days)) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          if (txDate < cutoff) return false;
        }
      }

      if (frequency === "custom") {
        if (startDate && txDate < startDate) return false;
        if (endDate && txDate > endDate) return false;
      }

      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();


  


  useEffect(() => {

    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        
        let userTransactions = [];
        const userId = cUser._id || cUser.id;
        
        try {
          // Try JSON-Server first
          const { data } = await axios.get(getTransactions);
          
          userTransactions = Array.isArray(data) ? data : (data.transactions || []);
          userTransactions = userTransactions.filter(t => t.userId === userId);
        } catch (err) {
          // Fallback to localStorage
          const allTransactions = JSON.parse(localStorage.getItem("appTransactions") || "[]");
          userTransactions = allTransactions.filter(t => t.userId === userId);
        }
  
        setTransactions(userTransactions);
  
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err.message);
        setTransactions([]);
        setLoading(false);
      }
    };

    if (cUser) {
      fetchAllTransactions();
    }
  }, [refresh, frequency, endDate, type, startDate, cUser]);

  const handleTableClick = (e) => {
    setView("table");
  };

  const handleChartClick = (e) => {
    setView("chart");
  };

  return (
    <>
      <Header />

      {loading ? (
        <>
          <Spinner />
        </>
      ) : (
        <>
          <Container fluid className="mt-3" style={{ position: "relative", zIndex: 2, paddingLeft: '24px', paddingRight: '24px' }}>
            <Row className="g-3">
              {/* Main Content */}
              <Col lg={12}>
                <div className="main-content">
                  <div className="filterRow">
                    <div className="text-white">
                      <Form.Group className="mb-3" controlId="formSelectFrequency">
                        <Form.Label>Select Frequency</Form.Label>
                        <Form.Select
                          name="frequency"
                          value={frequency}
                          onChange={handleChangeFrequency}
                        >
                          <option value="7">Last Week</option>
                          <option value="30">Last Month</option>
                          <option value="365">Last Year</option>
                          <option value="custom">Custom</option>
                        </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="text-white type">
                      <Form.Group className="mb-3" controlId="formSelectFrequency">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                          name="type"
                          value={type}
                          onChange={handleSetType}
                        >
                          <option value="all">All</option>
                          <option value="expense">Expense</option>
                          <option value="credit">Earned</option>
                        </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="text-white iconBtnBox">
                      <FormatListBulletedIcon
                        sx={{ cursor: "pointer" }}
                        onClick={handleTableClick}
                        className={`${
                          view === "table" ? "iconActive" : "iconDeactive"
                        }`}
                      />
                      <BarChartIcon
                        sx={{ cursor: "pointer" }}
                        onClick={handleChartClick}
                        className={`${
                          view === "chart" ? "iconActive" : "iconDeactive"
                        }`}
                      />
                    </div>

                    <div style={{ marginTop: '29px', alignSelf: 'flex-start' }}>
                      <Button onClick={handleShow} className="addNew">
                        Add New
                      </Button>
                      <Button onClick={handleShow} className="mobileBtn">
                        +
                      </Button>
                      <Modal show={show} onHide={handleClose} centered>
                        <Modal.Header closeButton>
                          <Modal.Title>Add Transaction Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Form>
                            <Form.Group className="mb-3" controlId="formName">
                              <Form.Label>Title</Form.Label>
                              <Form.Control
                                name="title"
                                type="text"
                                placeholder="Enter Transaction Name"
                                value={values.name}
                                onChange={handleChange}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formAmount">
                              <Form.Label>Amount</Form.Label>
                              <Form.Control
                                name="amount"
                                type="number"
                                placeholder="Enter your Amount"
                                value={values.amount}
                                onChange={handleChange}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formSelect">
                              <Form.Label>Category</Form.Label>
                              <Form.Select
                                name="category"
                                value={values.category}
                                onChange={handleChange}
                              >
                                <option value="">Choose...</option>
                                <option value="Groceries">Groceries</option>
                                <option value="Rent">Rent</option>
                                <option value="Salary">Salary</option>
                                <option value="Tip">Tip</option>
                                <option value="Food">Food</option>
                                <option value="Medical">Medical</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Transportation">Transportation</option>
                                <option value="Other">Other</option>
                              </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formDescription">
                              <Form.Label>Description</Form.Label>
                              <Form.Control
                                type="text"
                                name="description"
                                placeholder="Enter Description"
                                value={values.description}
                                onChange={handleChange}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formSelect1">
                              <Form.Label>Transaction Type</Form.Label>
                              <Form.Select
                                name="transactionType"
                                value={values.transactionType}
                                onChange={handleChange}
                              >
                                <option value="">Choose...</option>
                                <option value="Credit">Credit</option>
                                <option value="Expense">Expense</option>
                              </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formDate">
                              <Form.Label>Date</Form.Label>
                              <Form.Control
                                type="date"
                                name="date"
                                value={values.date}
                                onChange={handleChange}
                              />
                            </Form.Group>

                            {/* Add more form inputs as needed */}
                          </Form>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={handleClose}>
                            Close
                          </Button>
                          <Button variant="primary" onClick={handleSubmit}>
                            Submit
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </div>
                  </div>
                  <br style={{ color: "white" }}></br>

                  {frequency === "custom" ? (
                    <>
                      <div className="date">
                        <div className="form-group">
                          <label htmlFor="startDate" className="text-white">
                            Start Date:
                          </label>
                          <div>
                            <DatePicker
                              selected={startDate}
                              onChange={handleStartChange}
                              selectsStart
                              startDate={startDate}
                              endDate={endDate}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="endDate" className="text-white">
                            End Date:
                          </label>
                          <div>
                            <DatePicker
                              selected={endDate}
                              onChange={handleEndChange}
                              selectsEnd
                              startDate={startDate}
                              endDate={endDate}
                              minDate={startDate}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}

                  <div className="containerBtn">
                    <Button variant="primary" onClick={handleReset}>
                      Reset Filter
                    </Button>
                  </div>
                  {view === "table" ? (
                    <>
                      <TableData data={filteredTransactions} user={cUser} />
                    </>
                  ) : (
                    <>
                      <Analytics transactions={filteredTransactions} user={cUser} />
                    </>
                  )}
                </div>
              </Col>
            </Row>
            <ToastContainer />
          </Container>
        </>
      )}
    </>
  );
};

export default Home;
