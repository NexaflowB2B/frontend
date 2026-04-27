// Ensure Chart.js is loaded via CDN in the HTML before calling these functions.

let incomeExpenseChartInstance = null;
let inventoryChartInstance = null;

globalThis.renderIncomeExpenseChart = function renderIncomeExpenseChart(canvasId, transactions) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    return;
  }

  const dateMap = {};
  const sortedTransactions = [...transactions].sort(
    (left, right) => new Date(left.created_at) - new Date(right.created_at),
  );

  sortedTransactions.forEach((transaction) => {
    const dateStr = new Date(transaction.created_at).toISOString().split('T')[0];
    if (!dateMap[dateStr]) {
      dateMap[dateStr] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      dateMap[dateStr].income += transaction.amount;
    }
    if (transaction.type === 'expense') {
      dateMap[dateStr].expense += transaction.amount;
    }
  });

  const labels = Object.keys(dateMap);
  const incomeData = labels.map((date) => dateMap[date].income);
  const expenseData = labels.map((date) => dateMap[date].expense);

  if (incomeExpenseChartInstance) {
    incomeExpenseChartInstance.destroy();
  }

  incomeExpenseChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 6 } },
      },
      scales: {
        y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
        x: { grid: { display: false } },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
    },
  });
};

globalThis.renderInventoryChart = function renderInventoryChart(canvasId, products) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    return;
  }

  const sortedProducts = [...products].sort((left, right) => left.stock - right.stock).slice(0, 10);
  const labels = sortedProducts.map((product) => {
    if (product.name.length > 15) {
      return `${product.name.substring(0, 15)}...`;
    }
    return product.name;
  });
  const data = sortedProducts.map((product) => product.stock);
  const bgColors = data.map((stock) => {
    if (stock < 10) {
      return '#ef4444';
    }
    if (stock < 30) {
      return '#f59e0b';
    }
    return '#6366f1';
  });

  if (inventoryChartInstance) {
    inventoryChartInstance.destroy();
  }

  inventoryChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Stock Level',
          data,
          backgroundColor: bgColors,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
        x: { grid: { display: false } },
      },
    },
  });
};
