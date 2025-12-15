import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../page.css";
import axios from "axios";
import { getTransactions } from "../../utils/ApiRequest";

const Categories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        navigate("/login");
        return;
      }
      
      const userId = user._id || user.id;
      let userTransactions = [];
      let apiTransactions = [];
      let localTransactions = [];

      // Try to get from API first
      try {
        const { data } = await axios.get(getTransactions);
        apiTransactions = Array.isArray(data) ? data : (data.transactions || []);
        apiTransactions = apiTransactions.filter((t) => t.userId === userId);
        console.log("Categories: Fetched from API:", apiTransactions.length, "transactions");
      } catch (err) {
        console.log("Categories: API fetch failed, using localStorage only");
      }

      // Always check localStorage as well and merge
      try {
        const allTransactions = JSON.parse(localStorage.getItem("appTransactions") || "[]");
        localTransactions = allTransactions.filter((t) => t.userId === userId);
        console.log("Categories: Fetched from localStorage:", localTransactions.length, "transactions");
      } catch (err) {
        console.log("Categories: localStorage fetch failed");
      }

      // Merge transactions, preferring API data but including localStorage entries
      const transactionMap = new Map();
      
      // Add localStorage transactions first
      localTransactions.forEach(t => {
        const id = t.id || t._id;
        if (id) transactionMap.set(id, t);
      });
      
      // Override with API transactions (they take precedence)
      apiTransactions.forEach(t => {
        const id = t.id || t._id;
        if (id) transactionMap.set(id, t);
      });
      
      userTransactions = Array.from(transactionMap.values());
      console.log("Categories: Merged transactions:", userTransactions.length, "total");
      console.log("Categories: Setting transactions:", userTransactions);
      setTransactions(userTransactions);
    } catch (err) {
      console.error("Error loading transactions for categories:", err.message);
      setTransactions([]);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
      return;
    }

    // Always refetch when component mounts or pathname changes
    console.log("Categories: useEffect triggered, pathname:", location.pathname);
    fetchTransactions();
  }, [navigate, location.pathname, fetchTransactions]);

  // Refetch when window gains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (localStorage.getItem("user")) {
        fetchTransactions();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchTransactions]);

  // Listen for storage changes (when transactions are updated in localStorage from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "appTransactions" && localStorage.getItem("user")) {
        fetchTransactions();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchTransactions]);

  // Listen for custom event when transactions are updated in the same tab
  useEffect(() => {
    const handleTransactionsUpdated = () => {
      console.log("Categories: transactionsUpdated event received");
      if (localStorage.getItem("user")) {
        // Small delay to ensure localStorage/API is updated
        setTimeout(() => {
          fetchTransactions();
        }, 100);
      }
    };

    window.addEventListener("transactionsUpdated", handleTransactionsUpdated);
    return () => window.removeEventListener("transactionsUpdated", handleTransactionsUpdated);
  }, [fetchTransactions]);

  // Refetch when page becomes visible (user switches back to tab or navigates to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && localStorage.getItem("user")) {
        fetchTransactions();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchTransactions]);

  const defaultCategories = [
    { id: 1, name: "Groceries", icon: "🛒", color: "var(--accent)" },
    { id: 2, name: "Rent", icon: "🏠", color: "var(--accent)" },
    { id: 3, name: "Salary", icon: "💼", color: "var(--accent)" },
    { id: 4, name: "Food", icon: "🍕", color: "var(--accent)" },
    { id: 5, name: "Entertainment", icon: "🎬", color: "var(--accent)" },
    { id: 6, name: "Transportation", icon: "🚗", color: "var(--accent)" },
  ];

  // compute totals per category (count both expenses and credits)
  // Credits are positive (income), Expenses are negative (spending)
  const categoryTotals = transactions.reduce((acc, t) => {
    const cat = t.category || "Other";
    const amount = parseFloat(t.amount || 0) || 0;
    const isCredit = (t.transactionType === "Credit") || (t.type === "credit");
    const isExpense = (t.transactionType === "Expense") || (t.type === "expense");
    
    if (isCredit) {
      // Credits add to the total (income)
      acc[cat] = (acc[cat] || 0) + amount;
    } else if (isExpense) {
      // Expenses add to the total (spending)
      acc[cat] = (acc[cat] || 0) + amount;
    }
    
    return acc;
  }, {});

  // Debug logging
  useEffect(() => {
    console.log("Categories: Current transactions:", transactions);
    console.log("Categories: Category totals:", categoryTotals);
  }, [transactions, categoryTotals]);

  const formatAmount = (v) => {
    return Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <h1>Categories</h1>
          <p>Organize your spending by category</p>
        </div>

        <div className="page-content">
          <div className="categories-grid">
            {defaultCategories.map((cat) => (
              <div key={cat.id} className="category-card">
                <div className="category-emoji">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p className="category-amount">{categoryTotals[cat.name] ? `₹${formatAmount(categoryTotals[cat.name])}` : "₹0"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
