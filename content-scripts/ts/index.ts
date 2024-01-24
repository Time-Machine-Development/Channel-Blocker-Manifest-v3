console.log("START");

initBlockBtnCSS();

function loadContext() {
    const context = getYTContext();
    console.log(YTContext[context]);
    handleContextChange(context);
}

addTitleChangeObserver(loadContext);

loadContext();
