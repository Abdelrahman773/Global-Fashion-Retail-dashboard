import pandas as pd
from datetime import datetime

class CustomersAnalysis:
    def __init__(self, customers_path):
        cols = ['Customer ID', 'City', 'Country', 'Gender', 'Date Of Birth', 'Job Title', 'Email']
        self.df = pd.read_csv(customers_path, usecols=cols)
        self._clean_data()

    def _clean_data(self):
        self.df['Date Of Birth'] = pd.to_datetime(self.df['Date Of Birth'], errors='coerce')
        current_year = datetime.now().year
        self.df['Age'] = current_year - self.df['Date Of Birth'].dt.year
        
        bins = [0, 18, 25, 35, 45, 55, 120]
        labels = ['<18', '18-25', '26-35', '36-45', '46-55', '56+']
        self.df['Age Group'] = pd.cut(self.df['Age'], bins=bins, labels=labels)

        self.df['Job Status'] = self.df['Job Title'].apply(
            lambda x: 'Undisclosed' if pd.isna(x) or str(x).strip() == '' else 'Disclosed'
        )
        self.df['Job Title'] = self.df['Job Title'].fillna('Undisclosed')

        is_fake = self.df['Email'].astype(str).str.contains('fake', case=False, na=True)
        self.df['Email Status'] = is_fake.map({True: 'Fake / Missing', False: 'Valid Email'})
        self.df.loc[is_fake, 'Email'] = None
        
    def gender_count(self):
        counts = self.df['Gender'].value_counts()
        label_map = {'M': 'Male', 'F': 'Female', 'D': 'Other'}
        return [{"name": label_map.get(k, str(k)), "value": int(v)} for k, v in counts.items()]

    def age_groups_barchart(self):
        counts = self.df['Age Group'].value_counts().sort_index()
        return [{"ageGroup": str(k), "count": int(v)} for k, v in counts.items()]

    def top_cities_barchart(self):
        counts = self.df['City'].value_counts().head(10)
        return [{"city": str(k), "count": int(v)} for k, v in counts.items()]

    def top_jobs_barchart(self):
        valid_jobs = self.df[self.df['Job Title'] != 'Undisclosed']['Job Title']
        counts = valid_jobs.value_counts().head(10)
        return [{"job": str(k), "count": int(v)} for k, v in counts.items()]

    def data_privacy_by_country_and_gender(self):
        countries = ['All'] + sorted(self.df['Country'].dropna().unique().tolist())
        result = {"countries": countries, "data": {}}

        for country in countries:
            subset = self.df if country == 'All' else self.df[self.df['Country'] == country]
            grouped = []
            for gender_code, gender_label in [('M', 'Male'), ('F', 'Female')]:
                g_sub = subset[subset['Gender'] == gender_code]
                grouped.append({
                    "gender": gender_label,
                    "validEmails": int((g_sub['Email Status'] == 'Valid Email').sum()),
                    "fakeEmails": int((g_sub['Email Status'] == 'Fake / Missing').sum()),
                    "disclosedJobs": int((g_sub['Job Status'] == 'Disclosed').sum()),
                    "undisclosedJobs": int((g_sub['Job Status'] == 'Undisclosed').sum()),
                })
            result["data"][country] = grouped

        return result