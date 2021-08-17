function setLanguage(database, id) {
    const languageRow = database.prepare("SELECT * FROM languages WHERE id = ?").get(id)
    
    if (languageRow !== undefined) setLocale(languageRow.language)
    else setLocale("en")
}

module.exports = setLanguage