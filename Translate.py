from textblob import TextBlob

def get_language(text):
    blob = TextBlob(text)
    return blob.detect_language()

def to_english(text):
    blob = TextBlob(text)
    return blob.translate(to='en')
