import React, { useRef } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import logo from "../../images/logo.png";

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Calculate stats from transactions
const calculateStats = (transactions) => {
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const dailyWages = transactions
    .filter(
      (t) =>
        t.category === "wages" &&
        new Date(t.date).toDateString() === today.toDateString()
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlyContracts = transactions
    .filter(
      (t) =>
        t.category === "contract" &&
        new Date(t.date).getMonth() === thisMonth &&
        new Date(t.date).getFullYear() === thisYear
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlySupplies = transactions
    .filter(
      (t) =>
        t.category === "supplies" &&
        new Date(t.date).getMonth() === thisMonth &&
        new Date(t.date).getFullYear() === thisYear
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Calculate expenses and income
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = income - expenses;

  return {
    dailyWages,
    monthlyContracts,
    monthlySupplies,
    expenses,
    income,
    balance,
  };
};

// Generate report
const FinancialReport = ({
  transactions,
  projects,
  contractors,
  employees,
  supplies,
}) => {
  const stats = calculateStats(transactions);
  const reportRef = useRef(null);

  // Categorize transactions
  const wagesTransactions = transactions.filter((t) => t.category === "wages");
  const suppliesTransactions = transactions.filter(
    (t) => t.category === "supplies"
  );

  // Get current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format contractor status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    // Convert any status format to proper case (first letter capitalized)
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    if (!status) return "status-pending";

    const statusLower = status.toLowerCase();

    if (statusLower === "active" || statusLower === "available") {
      return "status-active";
    } else if (statusLower === "on leave" || statusLower === "unavailable") {
      return "status-on-leave";
    } else if (statusLower === "completed") {
      return "status-completed";
    } else {
      return "status-pending";
    }
  };

  // Function to print report
  const printReport = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Go Far Track Financial Report</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .report-container {
              max-width: 100%;
              margin: 0 auto;
            }
            .report-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .logo {
              height: 300px;
            }
            h1, h2, h3 {
              color: #2563eb;
              margin-top: 0;
            }
            h2 {
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
              margin-top: 30px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .stat-box {
              border: 1px solid #e2e8f0;
              border-radius: 5px;
              padding: 15px;
              background-color: #f8fafc;
            }
            .stat-title {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 20px;
              font-weight: bold;
              color: #0f172a;
            }
            .period {
              font-size: 12px;
              color: #2563eb;
              margin-top: 5px;
            }
            .balance-positive {
              background-color: #ecfdf5;
              border-color: #d1fae5;
            }
            .balance-positive .stat-value {
              color: #065f46;
            }
            .balance-negative {
              background-color: #fef2f2;
              border-color: #fee2e2;
            }
            .balance-negative .stat-value {
              color: #b91c1c;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th {
              background-color: #2563eb;
              color: white;
              text-align: left;
              padding: 10px;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-completed, .status-active {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-pending, .status-on-leave {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-failed {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .project-box {
              border: 1px solid #e5e7eb;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 15px;
              background-color: #f8fafc;
            }
            .project-title {
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
              color: #2563eb;
              font-size: 18px;
              font-weight: bold;
            }
            .project-details {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .detail-label {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 5px;
            }
            .detail-value {
              font-size: 14px;
              font-weight: 500;
              color: #0f172a;
            }
            .progress-bar {
              width: 100%;
              height: 8px;
              background-color: #e5e7eb;
              border-radius: 4px;
              margin-top: 5px;
            }
            .progress-value {
              height: 100%;
              background-color: #2563eb;
              border-radius: 4px;
            }
            .report-footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #2563eb;
              text-align: center;
            }
            .footer-text {
              font-size: 12px;
              color: #64748b;
              margin-bottom: 5px;
            }
            .footer-logo {
              height: 100px;
              margin-top: 10px;
            }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <!-- Header -->
            <div class="report-header">
              <div>
                <h1>Financial Report</h1>
                <p>Generated on ${currentDate}</p>
              </div>
              <img src="${logo}" alt="Go Far Track Logo" class="logo" />
            </div>
            
            <!-- Financial Overview -->
            <div>
              <h2>Financial Overview</h2>
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="stat-title">Total Income</div>
                  <div class="stat-value">${formatCurrency(stats.income)}</div>
                </div>
                
                <div class="stat-box">
                  <div class="stat-title">Total Expenses</div>
                  <div class="stat-value">${formatCurrency(
                    stats.expenses
                  )}</div>
                </div>
                
                <div class="stat-box ${
                  stats.balance >= 0 ? "balance-positive" : "balance-negative"
                }">
                  <div class="stat-title">Net Balance</div>
                  <div class="stat-value">${formatCurrency(
                    Math.abs(stats.balance)
                  )}</div>
                </div>
              </div>
              
              <div class="stats-grid">
                <div class="stat-box" style="background-color: #eff6ff; border-color: #dbeafe;">
                  <div class="stat-title">Daily Wages</div>
                  <div class="stat-value">${formatCurrency(
                    stats.dailyWages
                  )}</div>
                  <div class="period">Today</div>
                </div>
                
                <div class="stat-box" style="background-color: #f0fdf4; border-color: #dcfce7;">
                  <div class="stat-title">Contract Payments</div>
                  <div class="stat-value">${formatCurrency(
                    stats.monthlyContracts
                  )}</div>
                  <div class="period">This Month</div>
                </div>
                
                <div class="stat-box" style="background-color: #faf5ff; border-color: #f3e8ff;">
                  <div class="stat-title">Supplies Expenses</div>
                  <div class="stat-value">${formatCurrency(
                    stats.monthlySupplies
                  )}</div>
                  <div class="period">This Month</div>
                </div>
              </div>
            </div>
            
            <!-- Transactions -->
            <div>
              <h2>Transaction Categories</h2>
              
              <!-- Wages Transactions -->
              <h3>Wages</h3>
              ${
                wagesTransactions.length > 0
                  ? `
                <table>
                  <thead>
                    <tr>
                      <th style="width: 15%">Date</th>
                      <th style="width: 30%">Description</th>
                      <th style="width: 20%">Recipient</th>
                      <th style="width: 15%">Amount</th>
                      <th style="width: 20%">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${wagesTransactions
                      .slice(0, 5)
                      .map(
                        (t, i) => `
                      <tr>
                        <td>${formatDate(t.date)}</td>
                        <td>${t.description}</td>
                        <td>${t.recipient}</td>
                        <td style="color: ${
                          t.type === "expense" ? "#dc2626" : "#16a34a"
                        }">
                          ${t.type === "expense" ? "-" : "+"}${formatCurrency(
                          Math.abs(t.amount)
                        )}
                        </td>
                        <td>
                          <span class="status-badge ${
                            t.status === "completed"
                              ? "status-completed"
                              : t.status === "pending"
                              ? "status-pending"
                              : "status-failed"
                          }">
                            ${
                              t.status?.charAt(0).toUpperCase() +
                              t.status?.slice(1)
                            }
                          </span>
                        </td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
                  : `<p style="font-style: italic; color: #64748b;">No wages transactions recorded</p>`
              }
              
              <!-- Supplies Transactions -->
              <h3>Supplies</h3>
              ${
                suppliesTransactions.length > 0
                  ? `
                <table>
                  <thead>
                    <tr>
                      <th style="width: 15%">Date</th>
                      <th style="width: 30%">Description</th>
                      <th style="width: 20%">Supplier</th>
                      <th style="width: 15%">Amount</th>
                      <th style="width: 20%">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${suppliesTransactions
                      .slice(0, 5)
                      .map(
                        (t, i) => `
                      <tr>
                        <td>${formatDate(t.date)}</td>
                        <td>${t.description}</td>
                        <td>${t.recipient}</td>
                        <td style="color: ${
                          t.type === "expense" ? "#dc2626" : "#16a34a"
                        }">
                          ${t.type === "expense" ? "-" : "+"}${formatCurrency(
                          Math.abs(t.amount)
                        )}
                        </td>
                        <td>
                          <span class="status-badge ${
                            t.status === "completed"
                              ? "status-completed"
                              : t.status === "pending"
                              ? "status-pending"
                              : "status-failed"
                          }">
                            ${
                              t.status?.charAt(0).toUpperCase() +
                              t.status?.slice(1)
                            }
                          </span>
                        </td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
                  : `<p style="font-style: italic; color: #64748b;">No supplies transactions recorded</p>`
              }
            </div>
            
            <!-- Projects Summary -->
            <div>
              <h2>Projects Summary</h2>
              ${
                projects.length > 0
                  ? `
                ${projects
                  .map(
                    (project, i) => `
                  <div class="project-box">
                    <div class="project-title">${project.name}</div>
                    <div class="project-details">
                      <div>
                        <div class="detail-label">Location:</div>
                        <div class="detail-value">${project.location}</div>
                      </div>
                      
                      <div>
                        <div class="detail-label">Budget:</div>
                        <div class="detail-value">${formatCurrency(
                          project.budget || 0
                        )}</div>
                      </div>
                      
                      <div>
                        <div class="detail-label">Status:</div>
                        <span class="status-badge ${
                          project.status === "On Track"
                            ? "status-completed"
                            : project.status === "Delayed"
                            ? "status-pending"
                            : project.status === "Completed"
                            ? "status-completed"
                            : "status-failed"
                        }">
                          ${project.status}
                        </span>
                      </div>
                      
                      <div>
                        <div class="detail-label">Progress:</div>
                        <div class="progress-bar">
                          <div class="progress-value" style="width: ${
                            project.progress || 0
                          }%"></div>
                        </div>
                        <div style="font-size: 12px; margin-top: 5px;">${
                          project.progress || 0
                        }%</div>
                      </div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              `
                  : `<p style="font-style: italic; color: #64748b;">No projects available</p>`
              }
            </div>
            
            <!-- Contractors -->
            <div>
              <h2>Contractors</h2>
              ${
                contractors.length > 0
                  ? `
                <table>
                  <thead>
                    <tr>
                      <th style="width: 30%">Name</th>
                      <th style="width: 30%">Specialty</th>
                      <th style="width: 20%">Phone</th>
                      <th style="width: 20%">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${contractors
                      .map(
                        (c, i) => `
                      <tr>
                        <td>${c.name}</td>
                        <td>${c.specialization || c.specialty || "General"}</td>
                        <td>${c.phone}</td>
                        <td>
                          <span class="status-badge ${getStatusBadgeClass(
                            c.status
                          )}">
                            ${formatStatus(c.status)}
                          </span>
                        </td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
                  : `<p style="font-style: italic; color: #64748b;">No contractors available</p>`
              }
            </div>
            
            <!-- Footer -->
            <div class="report-footer">
              <div class="footer-text">This is an automatically generated report from <strong>Go Far Track construction tracker</strong></div>
              <div class="footer-text">Generated on ${currentDate}</div>
              <img src="${logo}" alt="Go Far Track Logo" class="footer-logo" />
            </div>
          </div>
          
          <script>
            // Print automatically
            window.onload = function() {
              window.print();
              // Close window after printing (or if print is canceled)
              var closePrintDialog = function() {
                if (!document.execCommand('print')) {
                  window.close();
                }
              };
              setTimeout(closePrintDialog, 1000);
            };
            
            // Handle print dialog close
            window.addEventListener('afterprint', function() {
              window.close();
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <button
      onClick={printReport}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
    >
      <DocumentTextIcon className="w-4 h-4 mr-2" />
      Generate PDF Report
    </button>
  );
};

export default FinancialReport;
