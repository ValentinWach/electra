import sainteLague

states = [
    "Schleswig-Holstein", "Mecklenburg-Vorpommern", "Hamburg", "Niedersachsen", "Bremen",
    "Brandenburg", "Sachsen-Anhalt", "Berlin", "Nordrhein-Westfalen", "Sachsen",
    "Hessen", "Thüringen", "Rheinland-Pfalz", "Bayern", "Baden-Württemberg", "Saarland"
]
population = [
    2659792, 1532412, 1537766, 7207587, 548941, 2397701, 2056177, 2942960,
    15415642, 3826905, 5222158, 1996822, 3610865, 11328866, 9313413, 865191
]
seats = 598
sainteLague.compute("saintelague", population, seats, states, verbose=True)