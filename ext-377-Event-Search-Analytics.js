if (window.ccpaShareAnalytics && typeof window.searchTrackingSetAnalytics === 'undefined') {
    window.searchTrackingSetAnalytics = true;

    $('body').on('searchChanged.searchTrackingSetAnalytics', function(event, options){
        window.searchTrackingSetAnalytics = 'undefined';
        let search_term = $('#searchTerm-main').val() || '';
        search_term = search_term.toLowerCase();
        let optionsTerm = options.term || '';
        optionsTerm = optionsTerm.toLowerCase();
        
        // SPA 2nd+ search term search results
        // var searchResultViewed = window.tealiumUtils.checkSRV();
        // console.log('searchChanged searchChanged searchResultViewede: ' + searchResultViewed);
        // utag.data.searchResultViewed = srv;
        
        let searchType = options.type || '';
        searchType = searchType.trim();
        // What? simple has type "Simple", we don't need length check. if ( options.type.indexOf('Type Ahead:') >=0  && options.type.length <= 12) {
        if ( options.type.trim() === 'Type Ahead:') {
            // is missing a Type Ahead group name
            var targetLink = $('a.searchTypeAheadList_itemLink').filter( function (index) {
               var linkText = $(this).text().trim();
               return linkText === optionsTerm;
            });
            if (targetLink) {
                searchType += targetLink.closest('.searchTypeAheadList_item').prevAll('.searchTypeAheadList_headline').first().text();
            }
            
            window.tealiumUtils.lsSetItem('typeAheadLinkClicked', true);
        }
        
        let viewData = {
            searchPerformed: true,
            searchType: searchType,
            // searchResultViewed let listPageViewed handler w/evnt75 track it as a "list" page
        };
        
        if (options.type === 'Simple') {
            viewData.searchTerm = optionsTerm.toLowerCase();
        } else {
            viewData.searchTerm = options.link;
            viewData.searchEntered = search_term;
        }
        
        utag.view(viewData, null, [123]);
            //123: Adobe
    });
}
