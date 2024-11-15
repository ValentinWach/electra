import pandas as pd

# Daten einlesen
alte_daten = pd.read_csv("alte_daten.csv", sep=";", header=None,
                         names=["NameVorname", "Geburtsjahr", "Partei", "Kandidatur"])
wahlkreise = pd.read_csv("wahlkreis_struktur.csv", sep=";", usecols=["Land", "Wahlkreis-Nr.", "Wahlkreis-Name"])


# Funktion zur Aufteilung von Name und Vorname
def split_name(name_vorname):
    if "," in name_vorname:
        parts = name_vorname.split(", ")
        return parts[1], parts[0]
    return "", name_vorname


# Funktion zur Verarbeitung der Kandidaturen
def process_kandidatur(kandidatur):
    if "Wahlkreis" in kandidatur:
        gebietsart = "Wahlkreis"
        nummer = kandidatur.split()[-1]
    elif "Land" in kandidatur:
        gebietsart = "Land"
        nummer = None
    else:
        gebietsart = ""
        nummer = ""
    return gebietsart, nummer


# Liste für die neuen Daten
neue_daten = []

# Iteriere durch alte Daten
for _, row in alte_daten.iterrows():
    vorname, nachname = split_name(row["NameVorname"])
    geburtsjahr = row["Geburtsjahr"]
    partei = row["Partei"]
    kandidaturen = row["Kandidatur"].split("und")

    for kandidatur in kandidaturen:
        kandidatur = kandidatur.strip()
        gebietsart, gebietsnummer = process_kandidatur(kandidatur)

        # Gebietsname anhand der Strukturdatei
        gebietsname = ""
        if gebietsnummer:
            gebietsname = wahlkreise.loc[
                wahlkreise["Wahlkreis-Nr."].astype(str) == gebietsnummer, "Wahlkreis-Name"].values
            gebietsname = gebietsname[0] if len(gebietsname) > 0 else ""

        neue_daten.append([
            "BT",  # Wahlart
            "26.09.2021",  # Wahltag
            "",  # Titel
            "",  # Namenszusatz
            nachname,
            vorname,
            "",  # Künstlername
            "",  # Geschlecht (nicht im alten Format)
            geburtsjahr,
            "",  # PLZ
            "",  # Wohnort
            "",  # Staat
            "",  # WohnortLandAbk
            "",  # Geburtsort
            "",  # Staatsangehörigkeit
            "",  # Beruf
            "",  # Berufsschluessel
            gebietsart,
            gebietsnummer,
            gebietsname,
            "",  # GebietLandAbk
            partei,
            partei,  # Langform, hier identisch
            "",  # Listenplatz
            "",  # VerknKennzeichen
            "",  # VerknGebietsart
            "",  # VerknGebietsnummer
            "",  # VerknGebietsname
            "",  # VerknGebietLandAbk
            "",  # VerknGruppenname
            "",  # VerknListenplatz
            "",  # VorpGewaehlt
        ])

# In ein neues DataFrame schreiben
neue_daten_df = pd.DataFrame(neue_daten, columns=[
    "Wahlart", "Wahltag", "Titel", "Namenszusatz", "Nachname", "Vornamen", "Künstlername", "Geschlecht", "Geburtsjahr",
    "PLZ", "Wohnort", "Staat", "WohnortLandAbk", "Geburtsort", "Staatsangehörigkeit", "Beruf", "Berufsschluessel",
    "Gebietsart", "Gebietsnummer", "Gebietsname", "GebietLandAbk", "Gruppenname", "GruppennameLang", "Listenplatz",
    "VerknKennzeichen", "VerknGebietsart", "VerknGebietsnummer", "VerknGebietsname", "VerknGebietLandAbk",
    "VerknGruppenname", "VerknListenplatz", "VorpGewaehlt"
])

# In CSV speichern
neue_daten_df.to_csv("neue_daten.csv", sep=";", index=False)
print("Umwandlung abgeschlossen. Neue Datei: neue_daten.csv")
