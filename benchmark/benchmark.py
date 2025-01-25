from locust import HttpUser, task, between
import random

class ElectionSystemUser(HttpUser):
    # Set wait time between requests - will be randomized between 0.8*t and 1.2*t
    wait_time = between(0.8, 1.2)  # Default 1 second, adjust t as needed
    
    def on_start(self):
        # Initialize with some common data
        self.wahl_id = 1  # Default election ID
        self.wahlkreis_id = 1  # Default wahlkreis ID
        self.partei_id = 1  # Default party ID
    
    @task(25)
    def q1_sitzverteilung(self):
        """Q1: Get seat distribution (25% of requests)"""
        self.client.get(f"/results/{self.wahl_id}/sitzverteilung")
    
    @task(10)
    def q2_abgeordnete(self):
        """Q2: Get all parliament members (10% of requests)"""
        self.client.get(f"/results/{self.wahl_id}/abgeordnete")
    
    @task(25)
    def q3_wahlkreis_overview(self):
        """Q3: Get wahlkreis overview (25% of requests)"""
        # Get basic overview
        self.client.get(f"/results/{self.wahl_id}/overview/wahlkreis/{self.wahlkreis_id}")
        # Get vote distribution
        self.client.get(f"/results/{self.wahl_id}/stimmanteil/wahlkreis/{self.wahlkreis_id}")
    
    @task(10)
    def q4_stimmkreissieger(self):
        """Q4: Get winning parties per wahlkreis (10% of requests)"""
        self.client.get(f"/results/{self.wahl_id}/winningparties/wahlkreis/{self.wahlkreis_id}")
    
    @task(10)
    def q5_ueberhangmandate(self):
        """Q5: Get surplus seats per party (10% of requests)"""
        self.client.get(f"/results/{self.wahl_id}/ueberhang/{self.partei_id}")
    
    @task(20)
    def q6_knappste_sieger(self):
        """Q6: Get closest winners for parties (20% of requests)"""
        self.client.get(f"/results/{self.wahl_id}/{self.partei_id}/closestwinners")

# To run:
# locust -f benchmark.py --host=http://localhost:8000
