import pandas as pd

# Daten einlesen
df = pd.read_csv("kerg2_2017.csv", sep=";", keep_default_na=False)
filtered_df = df[(df['Gruppenart'] == 'Partei') | (df['Gruppenart'] == 'Einzelbewerber/Wählergruppe')]
neue_daten = []
for index, row in filtered_df.iterrows():

    row['Gruppenname'] = 'HEIMAT (2021: NPD)' if row['Gruppenname'] == 'NPD' else row['Gruppenname']
    row['Gruppenname'] = 'Wir Bürger (2021: LKR)' if row['Gruppenname'] == 'LKR' else row['Gruppenname'] #Scheint aber in der 2017 Datei nicht vorzukommen?
    row['Gruppenname'] = 'Verjüngungsforschung (2021: Gesundheitsforschung)' if row['Gruppenname'] == 'Gesundheitsforschung' else row['Gruppenname']

    Gruppenart_XML = {
        "Einzelbewerber/Wählergruppe": "EINZELBEWERBER",
        "Partei": "PARTEI"
    }.get(row["Gruppenart"])
    neue_daten.append([
        Gruppenart_XML,
        row["Gruppenname"],
        ""
    ])
# In ein neues DataFrame schreiben
neue_daten_df = pd.DataFrame(neue_daten, columns=[
    "Gruppenart_XML", "Gruppenname_kurz", "Gruppenname_lang"
])

# In CSV speichern
neue_daten_df.drop_duplicates().to_csv("parteien_2017.csv", sep=";", index=False)
print("Umwandlung abgeschlossen. Neue Datei: parteien_2017.csv")
