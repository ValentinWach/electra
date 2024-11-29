import pandas as pd

# Daten einlesen
alte_daten = pd.read_csv("kandidaten_2017.csv", sep=";", header=None,
                         names=["Name, Vorname(n)", "Geburts_jahr", "Partei", "kandidiert im"])
wahlkreise = pd.read_csv("strukturdaten_2021.csv", sep=";", usecols=["Land", "Wahlkreis-Nr.", "Wahlkreis-Name"])


# Funktion zur Aufteilung von Name und Vorname
def split_name(name_vorname):
    if "," in name_vorname:
        parts = name_vorname.split(", ")
        nachname = parts[0].replace("Dr. ", "").replace("Prof. ", "").replace("Prof. Dr. ", "").strip()
        return parts[1], nachname
    raise ValueError(f"Invalid name format: {name_vorname}")


# Funktion zur Verarbeitung der Kandidaturen
def process_kandidatur(kandidatur):
    if "Wahlkreis" in kandidatur:
        gebietsart = "Wahlkreis"
        kennzeichen = "Kreiswahlvorschlag"
        nummer = kandidatur.split()[-1]
        listenplatz = None
    elif "Land" in kandidatur:
        gebietsart = "Land"
        kennzeichen = "Landesliste"
        nummer = None
        listenplatz = kandidatur.split()[-1].split(")")[0]
    else:
        raise ValueError(f"Kandidatur ist weder Land noch Wahlkreis {kandidatur}")
    return gebietsart, kennzeichen, nummer, listenplatz


# Liste für die neuen Daten
neue_daten = []

# Iteriere durch alte Daten

row_iterator = alte_daten.iterrows()
next(row_iterator)
try:
    while True:
        _, row = next(row_iterator)
        vorname, nachname = split_name(row["Name, Vorname(n)"])
        geburtsjahr = row["Geburts_jahr"]
        partei = row["Partei"]
        kandidaturen = row["kandidiert im"].split("und")

        for kandidatur in kandidaturen:
            kandidatur = kandidatur.strip()

            if kandidatur == "":
                try:
                    _, row = next(row_iterator)
                    kandidatur = row["kandidiert im"]
                except StopIteration:
                    break
                if not pd.isna(row["Partei"]):
                    partei = row["Partei"]

            gebietsart, kennzeichen, gebietsnummer, listenplatz = process_kandidatur(kandidatur)
            # Gebietsname anhand der Strukturdatei
            gebietsname = kandidatur.split()[1] #Falls Land stimmt das
            if gebietsnummer: #Falls Wahlkreis mis der Gebietsname aus der Strukturdatei kommen
                gebietsname = wahlkreise.loc[
                    wahlkreise["Wahlkreis-Nr."].astype(str) == gebietsnummer.lstrip("0"), "Wahlkreis-Name"].values
                gebietsname = gebietsname[0] if len(gebietsname) > 0 else ""

            neue_daten.append([
                "BT",  # Wahlart
                "24.09.2017",  # Wahltag
                nachname,
                vorname,
                geburtsjahr,
                kennzeichen,
                gebietsart,
                gebietsnummer,
                gebietsname,
                partei,
                "",
                listenplatz,
                ""
            ])
except StopIteration:
    print("completed")

# In ein neues DataFrame schreiben
neue_daten_df = pd.DataFrame(neue_daten, columns=[
    "Wahlart", "Wahltag", "Nachname", "Vornamen", "Geburtsjahr",
    "Kennzeichen", "Gebietsart", "Gebietsnummer", "Gebietsname",
    "Gruppenname", "GruppennameLang" , "Listenplatz", "Beruf"
])

# In CSV speichern
neue_daten_df.to_csv("kandidaturen_2017.csv", sep=";", index=False)
print("Umwandlung abgeschlossen. Neue Datei: kandidaturen_2017.csv")
