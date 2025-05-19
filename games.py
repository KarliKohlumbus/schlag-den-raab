import random

outfile = open("gameslist.txt", "w")

games = ["Kniffel", "Maexchen", "Fifa", "Tricky Towers",
        "Lethal League", "Schach", "4gewinnt", "Balatro", "WWM"]

early_games = ["Guess the Price", "Geoguessr-Quiz", "Higher Lower", "Dart", "Schiffe versenken"]

offset = len(early_games)

for i in range(1, len(early_games) + 1):
    game = random.choice(early_games)
    #print(str(i) + ": " + game)
    outfile.write(game + "\n")
    early_games.remove(game)

for j in range(1, len(games) + 1):
    game = random.choice(games)
    #print(str(offset + j) + ": " + game)
    outfile.write(game + "\n")
    games.remove(game)

print("15: Schlag den Raab")
outfile.write("Schlag den Raab")