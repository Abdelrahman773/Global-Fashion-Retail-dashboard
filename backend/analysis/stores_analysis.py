"""Analysis helpers for the Global Fashion Retail stores dataset."""
from pathlib import Path
import pandas as pd


class StoresAnalysis:
    """Load, validate and summarize store locations and staffing data."""

    REQUIRED_COLUMNS = [
        "Store ID", "Country", "City", "Store Name",
        "Number of Employees", "ZIP Code", "Latitude", "Longitude",
    ]
    COUNTRY_LABELS = {
        "中国": "China",
        "Deutschland": "Germany",
        "España": "Spain",
    }

    def __init__(self, stores_path: str | Path):
        self.df = pd.read_csv(stores_path)
        missing = [column for column in self.REQUIRED_COLUMNS if column not in self.df.columns]
        if missing:
            raise ValueError(f"Stores dataset is missing required columns: {', '.join(missing)}")
        self._clean_data()

    def _clean_data(self):
        """Convert numeric fields and remove rows that cannot be analyzed."""
        for column in ["Store ID", "Number of Employees", "Latitude", "Longitude"]:
            self.df[column] = pd.to_numeric(self.df[column], errors="coerce")

        for column in ["Country", "City", "Store Name", "ZIP Code"]:
            self.df[column] = self.df[column].astype("string").str.strip()

        self.df = self.df.dropna(
            subset=["Store ID", "Country", "City", "Store Name", "Number of Employees", "Latitude", "Longitude"]
        ).copy()
        self.df = self.df.drop_duplicates(subset=["Store ID"])
        self.df = self.df[self.df["Number of Employees"] >= 0].copy()

    @classmethod
    def display_country(cls, country: str) -> str:
        return cls.COUNTRY_LABELS.get(country, country)

    def summary(self):
        total_stores = int(self.df["Store ID"].nunique())
        total_employees = int(self.df["Number of Employees"].sum())
        total_countries = int(self.df["Country"].nunique())
        average = round(total_employees / total_stores, 2) if total_stores else 0
        country_store_counts = self.df.groupby("Country")["Store ID"].nunique()
        country_employee_totals = self.df.groupby("Country")["Number of Employees"].sum().sort_values(ascending=False)
        employee_counts = self.df["Number of Employees"]
        top_country = str(country_employee_totals.index[0]) if len(country_employee_totals) else None
        return {
            "total_stores": total_stores,
            "total_countries": total_countries,
            "total_employees": total_employees,
            "average_employees_per_store": average,
            "min_employees_per_store": int(employee_counts.min()) if total_stores else 0,
            "max_employees_per_store": int(employee_counts.max()) if total_stores else 0,
            "stores_per_country_are_equal": bool(country_store_counts.nunique() == 1) if len(country_store_counts) else False,
            "stores_per_country": int(country_store_counts.iloc[0]) if len(country_store_counts) and country_store_counts.nunique() == 1 else None,
            "top_employee_country": self.display_country(top_country) if top_country else None,
            "top_employee_country_total": int(country_employee_totals.iloc[0]) if len(country_employee_totals) else 0,
        }

    def stores_per_country(self):
        grouped = self.df.groupby("Country")["Store ID"].nunique().sort_values(ascending=False)
        return [
            {"country": self.display_country(str(country)), "count": int(count)}
            for country, count in grouped.items()
        ]

    def employees_per_country(self):
        grouped = self.df.groupby("Country")["Number of Employees"].sum().sort_values(ascending=False)
        return [
            {"country": self.display_country(str(country)), "employees": int(count)}
            for country, count in grouped.items()
        ]

    def employee_distribution(self):
        """Number of stores grouped by their employee count."""
        grouped = self.df.groupby("Number of Employees")["Store ID"].nunique().sort_index()
        return [
            {"employee_level": f"{int(employee_count)} employees", "store_count": int(store_count)}
            for employee_count, store_count in grouped.items()
        ]

    def employees_per_store(self):
        grouped = self.df.sort_values(["Number of Employees", "Store ID"], ascending=[False, True])
        return [
            {
                "store": str(row["Store Name"]),
                "city": str(row["City"]),
                "country": self.display_country(str(row["Country"])),
                "employees": int(row["Number of Employees"]),
            }
            for _, row in grouped.iterrows()
        ]

    def store_locations(self):
        return [
            {
                "store_id": int(row["Store ID"]),
                "store": str(row["Store Name"]),
                "city": str(row["City"]),
                "country": self.display_country(str(row["Country"])),
                "latitude": float(row["Latitude"]),
                "longitude": float(row["Longitude"]),
            }
            for _, row in self.df.iterrows()
        ]
