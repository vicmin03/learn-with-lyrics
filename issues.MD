## A list of known issues/bugs to fix

- Resizing song cards can cause text to be cut off/hidden so title isn't fully displayed 
- Fix nav bar (search isn't doing anything atm, should open search bar)
- EXT: Dictionary definitions are not always optimal - returns several options e.g. 都 -> how to choose best definition?
- EXT: how to get album covers - yt music api?
- potential issue with 了 - set as custom pinyin to default to le, but might not be able to handle cases where it is liao
- CHECK: how does it handle english lyrics? e.g. 刻在我心底的名字
- song cards grid doesn't take up enough horizontal space and titles get cut off - have max 3 across with enough space
- EXT:should player should persist across whole site??? (would need to manage with context then?)
- fix vocab look up box - might be cut off if too long and can't scroll since it is fixed -> add max height + scroll within the box?
- EXT: put volume in context so it's maintained throughout the page? or just save in cookies or something