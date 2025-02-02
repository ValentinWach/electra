from locust import HttpUser, task, between
import random

class ElectionSystemUser(HttpUser):
    # Set wait time between requests - will be randomized between 0.8*t and 1.2*t
    
    #use 0.5, 1, 3 seconds
    #users: 100, 1000, 10000
    t = 2
    wait_time = between(0.8*t, 1.2*t)
    
    
    def get_random_ids(self):
        """Get random IDs for each request"""
        return {
            'wahl_id': random.randint(1, 2),
            'wahlkreis_id': random.randint(1, 299),
            'partei_id': random.randint(1, 5)
        }
    
    @task(25)
    def q1_sitzverteilung(self):
        """Q1: Get seat distribution (25% of requests)"""
        ids = self.get_random_ids()
        self.client.get(f"/results/{ids['wahl_id']}/sitzverteilung", name="Q1_Sitzverteilung")
    
    @task(10)
    def q2_abgeordnete(self):
        """Q2: Get all parliament members (10% of requests)"""
        ids = self.get_random_ids()
        self.client.get(f"/results/{ids['wahl_id']}/abgeordnete", name="Q2_Abgeordnete")
    
    @task(25)
    def q3_wahlkreis_overview(self):
        """Q3: Get wahlkreis overview (25% of requests)"""
        ids = self.get_random_ids()
        # Get basic overview
        self.client.get(f"/results/{ids['wahl_id']}/overview/wahlkreis/{ids['wahlkreis_id']}", name="Q3_Wahlkreisübersicht")
        # Get vote distribution
        self.client.get(f"/results/{ids['wahl_id']}/stimmanteil/zweitstimmen/wahlkreis/{ids['wahlkreis_id']}", name="Q3_Wahlkreisübersicht")
        self.client.get(f"/results/{ids['wahl_id']}/stimmanteil/erststimmen/wahlkreis/{ids['wahlkreis_id']}", name="Q3_Wahlkreisübersicht")
    
    @task(10)
    def q4_stimmkreissieger(self):
        """Q4: Get winning parties per wahlkreis (10% of requests)"""
        ids = self.get_random_ids()
        self.client.get(f"/results/{ids['wahl_id']}/winningparties/wahlkreis/{ids['wahlkreis_id']}", name="Q4_Stimmkreissieger")
    
    @task(10)
    def q5_ueberhangmandate(self):
        """Q5: Get surplus seats per party (10% of requests)"""
        ids = self.get_random_ids()
        self.client.get(f"/results/{ids['wahl_id']}/ueberhang/{ids['partei_id']}", name="Q5_Ueberhangmandate")
    
    @task(20)
    def q6_knappste_sieger(self):
        """Q6: Get closest winners for parties (20% of requests)"""
        ids = self.get_random_ids()
        self.client.get(f"/results/{ids['wahl_id']}/{ids['partei_id']}/closestwinners", name="Q6_Knappste_Sieger")

# To run:
# locust -f benchmark.py --host=http://localhost:8000
