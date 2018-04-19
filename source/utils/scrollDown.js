function scrollDown(waitScroll, waitEnd)
{
    var promise = new Promise((resolve) =>
    {
        var windowHeight = window.innerHeight;
        var pages = Math.ceil(document.body.scrollHeight / windowHeight);
        var page = 1;
        var scroller = () =>
        {
            window.scrollTo(0, page * windowHeight);
            page++;
            if (page < pages)
            {
                setTimeout(scroller, waitScroll);
            }
            else
            {
                setTimeout(() => resolve(true), waitEnd);
            }
        };
        setTimeout(scroller, waitScroll);
    });
    return promise;
}
