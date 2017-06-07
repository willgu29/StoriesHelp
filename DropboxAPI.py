import dropbox

# Get your app key and secret from the Dropbox developer website
app_key = '	ix9io1232ilgyot'
app_secret = 'de7vm5zrht32cpk'

access_token = '6P_H4ouRhvAAAAAAAAAABkpwPVCqVu-izR6vChZYW3sWaWh129KCdD3s7fQEsCgE'
client = dropbox.client.DropboxClient(access_token)

client.account_info()


#user - dropbox
def upload(fileData, savePath):
    response = client.put_file(savePath, fileData)
    return response['path']

#dropbox - user
def download(filePath, savePath):
    f, metadata = client.get_file_and_metadata(filePath)
    out = open(savePath, 'wb')
    out.write(f.read())
    out.close()
    print metadata

def getFileURLForFilePath(filePath):
    data = client.media(filePath)
    print data['url']
    return data['url']
