function setLanguage(database, msg) {
    let callerID
    if (msg.guild) callerID = msg.guild.id
    else callerID = msg.author.id

    const languagesRequest = database.prepare("SELECT * FROM languages WHERE id = ?")
    const languageRow = languagesRequest.get(callerID)
    
    if (languageRow !== undefined) setLocale(languageRow.language)
    else setLocale("en")
}

module.exports = setLanguage