

class StoryMaker(Document):
    contentURLS = []
    
    def __init__(self, displayURL, downloadURL, formatType):
        self.displayURL = displayURL
        self.downloadURL = downloadURL
        self.formatType = formatType
