import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./home.css";
import { deleteTransactions, editTransactions } from "../../utils/ApiRequest";
import axios from "axios";

const TableData = (props) => {
  const [show, setShow] = useState(false);
  const [transactions, setTransactions] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currId, setCurrId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [user, setUser] = useState(null);

  const handleEditClick = (itemKey) => {
    // const buttonId = e.target.id;
    console.log("Clicked button ID:", itemKey);
    if (transactions.length > 0) {
      const editTran = props.data.filter((item) => item._id === itemKey || item.id === itemKey);
      setCurrId(itemKey);
      setEditingTransaction(editTran);
      handleShow();
    }
  };

  const handleEditSubmit = async (e) => {
    try {
      try {
        // Try PUT request first (JSON-Server style)
        const {data} = await axios.put(`${editTransactions}/${currId}`, {
          ...values,
        });

        if(data && (data.success === true || data.id)){
          await handleClose();
          await setRefresh(!refresh);
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent("transactionsUpdated"));
          window.location.reload();
        }
      } catch (err) {
        // Fallback to localStorage
        const allTransactions = JSON.parse(localStorage.getItem("appTransactions") || "[]");
        const updatedTransactions = allTransactions.map(t => {
          if(t._id === currId || t.id === currId){
            return { ...t, ...values };
          }
          return t;
        });
        localStorage.setItem("appTransactions", JSON.stringify(updatedTransactions));
        
        await handleClose();
        await setRefresh(!refresh);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent("transactionsUpdated"));
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  }

  const handleDeleteClick = async (itemKey) => {
    try {
      console.log("Deleting transaction with ID:", itemKey);
      setCurrId(itemKey);
      
      let deleted = false;
      
      try {
        // Try DELETE request first (JSON-Server style)
        const response = await axios.delete(`${deleteTransactions}/${itemKey}`);
        console.log("Delete response:", response);
        deleted = true;
      } catch (err) {
        console.log("JSON-Server delete failed, trying localStorage:", err.message);
        
        // Fallback to localStorage
        const allTransactions = JSON.parse(localStorage.getItem("appTransactions") || "[]");
        console.log("Current transactions in localStorage:", allTransactions);
        console.log("Looking for ID:", itemKey);
        
        // Filter out the transaction with matching _id or id
        const updatedTransactions = allTransactions.filter(t => {
          return t._id !== itemKey && t.id !== itemKey;
        });
        
        console.log("Deleted:", allTransactions.length - updatedTransactions.length, "transaction(s)");
        console.log("Updated transactions after delete:", updatedTransactions);
        localStorage.setItem("appTransactions", JSON.stringify(updatedTransactions));
        deleted = true;
      }
      
      if(deleted) {
        console.log("Transaction deleted successfully");
        await setRefresh(!refresh);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent("transactionsUpdated"));
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    }
  };

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

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    setShow(true);
  };

  useEffect(() => {
    setUser(props.user);
    setTransactions(props.data);
  }, [props.data,props.user, refresh]);

  return (
    <>
      <Container className="card-dark">
        <Table responsive="md" className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {props.data.map((item, index) => (
              <tr key={index}>
                <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                <td>{item.title}</td>
                <td>{item.amount}</td>
                <td>{item.transactionType}</td>
                <td>{item.category}</td>
                <td>
                  <div className="icons-handle">
                    <EditNoteIcon
                      sx={{ cursor: "pointer" }}
                        key={item._id || item.id}
                        id={item._id || item.id}
                        onClick={() => handleEditClick(item._id || item.id)}
                    />

                    <DeleteForeverIcon
                      sx={{ color: "red", cursor: "pointer" }}
                        key={item._id || item.id}
                        id={item._id || item.id}
                        onClick={() => handleDeleteClick(item._id || item.id)}
                    />

                    {editingTransaction ? (
                      <>
                        <div>
                          <Modal show={show} onHide={handleClose} centered>
                            <Modal.Header closeButton>
                              <Modal.Title>
                                Update Transaction Details
                              </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <Form onSubmit={handleEditSubmit}>
                                <Form.Group
                                  className="mb-3"
                                  controlId="formName"
                                >
                                  <Form.Label>Title</Form.Label>
                                  <Form.Control
                                    name="title"
                                    type="text"
                                    placeholder={editingTransaction[0].title}
                                    value={values.title}
                                    onChange={handleChange}
                                  />
                                </Form.Group>

                                <Form.Group
                                  className="mb-3"
                                  controlId="formAmount"
                                >
                                  <Form.Label>Amount</Form.Label>
                                  <Form.Control
                                    name="amount"
                                    type="number"
                                    placeholder={editingTransaction[0].amount}
                                    value={values.amount}
                                    onChange={handleChange}
                                  />
                                </Form.Group>

                                <Form.Group
                                  className="mb-3"
                                  controlId="formSelect"
                                >
                                  <Form.Label>Category</Form.Label>
                                  <Form.Select
                                    name="category"
                                    value={values.category}
                                    onChange={handleChange}
                                  >
                                    <option value="">{editingTransaction[0].category}</option>
                                    <option value="Groceries">Groceries</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Tip">Tip</option>
                                    <option value="Food">Food</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Entertainment">
                                      Entertainment
                                    </option>
                                    <option value="Transportation">
                                      Transportation
                                    </option>
                                    <option value="Other">Other</option>
                                  </Form.Select>
                                </Form.Group>

                                <Form.Group
                                  className="mb-3"
                                  controlId="formDescription"
                                >
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="description"
                                    placeholder={editingTransaction[0].description}
                                    value={values.description}
                                    onChange={handleChange}
                                  />
                                </Form.Group>

                                <Form.Group
                                  className="mb-3"
                                  controlId="formSelect1"
                                >
                                  <Form.Label>Transaction Type</Form.Label>
                                  <Form.Select
                                    name="transactionType"
                                    value={values.transactionType}
                                    onChange={handleChange}
                                  >
                                    <option value={editingTransaction[0].transactionType}>{editingTransaction[0].transactionType}</option>
                                    <option value="Credit">Credit</option>
                                    <option value="Expense">Expense</option>
                                  </Form.Select>
                                </Form.Group>

                                <Form.Group
                                  className="mb-3"
                                  controlId="formDate"
                                >
                                  <Form.Label>Date</Form.Label>
                                  <Form.Control
                                    type="date"
                                    name="date"
                                    value={values.date}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                              </Form>
                            </Modal.Body>
                            <Modal.Footer>
                              <Button variant="secondary" onClick={handleClose}>
                                Close
                              </Button>
                              <Button variant="primary" type="submit" onClick={handleEditSubmit}>Submit</Button>
                            </Modal.Footer>
                          </Modal>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default TableData;
