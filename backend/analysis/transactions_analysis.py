import pandas as pd

class TransactionsAnalysis:
    def __init__(self, sales_path, products_path):
        self.sales_df = pd.read_csv(sales_path)
        self.products_df = pd.read_csv(products_path)

        self.sales_df["Product ID"] = self.sales_df["Product ID"].astype(str)
        self.products_df["Product ID"] = self.products_df["Product ID"].astype(str)

        self.merged_df = self.sales_df.merge(
            self.products_df,
            on="Product ID",
            how="left"
        )

        self.sales_df["Date"] = pd.to_datetime(self.sales_df["Date"])

    def transaction_type_count(self):
        transaction_type_count = self.sales_df["Transaction Type"].value_counts()

        data = [
            {
                "transaction_type": transaction_type,
                "count": count
            }
            for transaction_type, count in transaction_type_count.items()
        ]

        return data

    def payment_method_count(self):
        payment_method_count = self.sales_df["Payment Method"].value_counts()

        data = [
            {
                "payment_method": payment_method,
                "count": count
            }
            for payment_method, count in payment_method_count.items()
        ]

        return data

    def size_count(self):
        size_count = self.sales_df["Size"].value_counts()

        data = [
            {
                "size": size,
                "count": count
            }
            for size, count in size_count.items()
        ]

        return data

    def monthly_revenue_linechart(self):
        df = self.sales_df[
            (self.sales_df["Date"].dt.year >= 2023) &
            (self.sales_df["Date"].dt.year <= 2025)
        ]

        monthly_revenue = (
            df.groupby(df["Date"].dt.to_period("M"))["Invoice Total"]
            .sum()
        )

        monthly_revenue.index = monthly_revenue.index.to_timestamp()

        data = [
            {
                "date": date.strftime("%Y-%m"),
                "revenue": revenue
            }
            for date, revenue in monthly_revenue.items()
        ]

        return data

    def best_sub_Catagories_barchart(self):
        top_15 = (
            self.merged_df.groupby("Sub Category")["Invoice Total"]
            .sum()
            .sort_values(ascending=False)
            .head(15)
            .reset_index()
        )

        data = [
            {
                "sub_category": row["Sub Category"],
                "revenue": row["Invoice Total"]
            }
            for _, row in top_15.iterrows()
        ]

        return data

    def top_selling_categories(self):
        categories_by_revenue = (
            self.merged_df.groupby("Category")["Invoice Total"]
            .sum()
            .sort_values(ascending=False)
            .reset_index()
        )

        data = [
            {
                "category": row["Category"],
                "revenue": row["Invoice Total"]
            }
            for _, row in categories_by_revenue.iterrows()
        ]

        return data

    def top_selling_products(self):
        products_by_revenue = (
            self.merged_df.groupby("Product ID")["Invoice Total"]
            .sum()
            .sort_values(ascending=False)
            .head(10)
            .reset_index()
        )

        data = [
            {
                "product_id": row["Product ID"],
                "revenue": row["Invoice Total"]
            }
            for _, row in products_by_revenue.iterrows()
        ]

        return data