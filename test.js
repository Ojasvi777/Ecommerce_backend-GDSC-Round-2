import fetch from "node-fetch"; // Ensure you installed node-fetch@2

const apiUrl = "http://localhost:5000/api/products"; // Your backend API endpoint

async function fetchProducts() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log("✅ Products from MongoDB:", data);
  } catch (error) {
    console.error("❌ Fetch Error:", error.message);
  }
}

fetchProducts();
