console.log("START");

initBlockBtnCSS();

function loadContext() {
    const context = getYTContext();
    console.log(YTContext[context]);
    updateObservers(context);
}

addTitleChangeObserver(loadContext);

loadContext();
