function scrollDown(wait)
{
    var promise = new Promise((resolve) =>
    {
        var windowHeight = window.innerHeight;
        var pages = Math.ceil(document.body.scrollHeight / windowHeight);
        var page = 1;
        var scroller = () =>
        {
            console.log('Scrolling to ', page * windowHeight);
            window.scrollTo(0, page * windowHeight);
            page++;
            if (page < pages)
            {
                setTimeout(scroller, wait);
            }
            else
            {
                setTimeout(() => resolve(true), wait * 2);
            }
        };
        setTimeout(scroller, wait);
    });
    return promise;
}
