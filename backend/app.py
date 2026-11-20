from flask import Flask, jsonify
from analysis.transactions_analysis import TransactionsAnalysis
from analysis.customers_analysis import CustomersAnalysis
from pathlib import Path

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

sales_path = DATA_DIR / "transactions.csv"
products_path = DATA_DIR / "products.csv"
customers_path = DATA_DIR / "customers DSAI 203.csv"
transaction_analysis = TransactionsAnalysis(sales_path, products_path)
customer_analysis = CustomersAnalysis(customers_path)

@app.route("/api/transaction-types")
def transaction_types():
    return jsonify(transaction_analysis.transaction_type_count())

@app.route("/api/payment-methods")
def payment_methods():
    return jsonify(transaction_analysis.payment_method_count())

@app.route("/api/sizes")
def sizes():
    return jsonify(transaction_analysis.size_count())

@app.route("/api/monthly-revenue")
def monthly_revenue():
    return jsonify(transaction_analysis.monthly_revenue_linechart())

@app.route("/api/best-sub-categories")
def best_sub_categories():
    return jsonify(transaction_analysis.best_sub_Catagories_barchart())

@app.route("/api/top-selling-categories")
def top_selling_categories():
    return jsonify(transaction_analysis.top_selling_categories())

@app.route("/api/top-selling-products")
def top_selling_products():
    return jsonify(transaction_analysis.top_selling_products())

@app.route("/api/customers/gender")
def customers_gender():
    return jsonify(customer_analysis.gender_count())

@app.route("/api/customers/age-groups")
def customers_age_groups():
    return jsonify(customer_analysis.age_groups_barchart())

@app.route("/api/customers/top-cities")
def customers_top_cities():
    return jsonify(customer_analysis.top_cities_barchart())

@app.route("/api/customers/top-jobs")
def customers_top_jobs():
    return jsonify(customer_analysis.top_jobs_barchart())

@app.route("/api/customers/privacy-stats")
def customers_privacy_stats():
    return jsonify(customer_analysis.data_privacy_by_country_and_gender())

if __name__ == "__main__":
    app.run(debug=True)
