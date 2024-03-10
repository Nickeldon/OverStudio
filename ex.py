def guess_and_update(word, state):
   
    guess = input("Guess a letter: ")
    found = False
    for i in range(len(word)):
        if word[i] == guess:
            state[i] = guess
            found = True
    return found
# ***** Do not change code above *****


def play_game(secret_word, max_tries):
    """ Plays the guessing game of Hangman.
    Args:
        secret_word (str): Secret word that user will try to guess
        max_tries (int):   Max no. of incorrect tries before stopping the game
    Returns: None
    """
    endgame = False
    tries = 0
    state = ['_'] * len(secret_word)
        
    while(endgame != True):
        tries += 1
        if ''.join(state) == secret_word:
                endgame = True
                print('Congrats, you won!')
        else:
            if tries - 1 == max_tries:
                endgame = True
            else:
                if guess_and_update(secret_word, state):
                    print(True)
                    print(state)
                else:
                    print(f'Incorrect! # of tries: {tries}')
                    print(False)




# Example 1:
play_game("common", 5)

# Example 2:
# play_game("common", 4)

# Example 3:
# play_game("python", 2)

# Example 4:
# play_game("cat", 3)
