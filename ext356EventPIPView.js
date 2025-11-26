if (window.ccpaShareAnalytics && typeof window.pipViewAnalytics === 'undefined') {
    if (b['meta.pageType'] === 'Product Detail') {
        window.pipViewAnalytics = true;
        
        // This FE fn returns adobeArrays plus several other data
        const collectionModelFunction = window.view && window.view.model ? window.view.model.getTrackingProductData : undefined;
        
        if (!!collectionModelFunction) {
            const trackingData = window.view.model.getTrackingProductData();
            
            b['googleAnalyticsAction'] = trackingData.googleAnalyticsAction;
            b['pipDetailView'] = trackingData.pipDetailView;
            const userSegments = window.tealiumUtils.getUserSegments();
            
            // Adobe & Google Tracking
            utag.view({
                // Map to 102
                products_allowDiscounts: trackingData.adobeArrays.allowDiscounts,
                
                // PRODUCTS_eVar105
                products_assignedBadgeName: trackingData.adobeArrays.assignedBadgeNames,
                
                // Map to 40 Availability
                products_availability: trackingData.adobeArrays.availabilities,
                
                // Map to 34 Competitive Intensity
                products_competitiveIntensity: trackingData.adobeArrays.competitiveIntensities,
                
                //Map to 13
                products_daysToShip: trackingData.adobeArrays.daysToShips,
                
                products_enablePremiumContent: trackingData.adobeArrays.enablePremiumContents,
                pip_enablePremiumContent: trackingData.adobeArrays.enablePremiumContents,
                
                // Map to 28 product only
                products_idOfAlternateShown: trackingData.adobeArrays.idsOfAlternatesShown,
                
                pipView_product_price: trackingData.adobeArrays.prices,
                
                pipView_product_quantity: trackingData.adobeArrays.quantities,
                
                // Map to 26 
                products_savingsPercent: trackingData.adobeArrays.savingsPcts,
                
                // Map to 29 substitute only, boolean was an alternate product
                products_shownAsAlternate: trackingData.adobeArrays.shownAsAlternate,
                
                pipView_product_sku: trackingData.adobeArrays.skus,
                
                // Additional
                googleAnalyticsAction: trackingData.googleAnalyticsAction,
                
                pipDetailView: trackingData.pipDetailView,
                
                searchResultViewed: trackingData.searchResultViewed,
                
                userSegments
            }, null, [78, 123]);
            // 78: Google Universal Analytics
            // 123: Adobe
            
        } else {
            // BEGIN Original method, untouched
            // START Interim Tracking 12/2023
            /*
            Each of the following mapped targets take ARRAY values.
            Alternates are tracked as Product 2. Unless where called out, each product gets the following additional Commerce properties:
            
            PRODUCTS_id pproductId
            PRODUCTS_quantity quantity (increment)
            PRODUCTS_price unit price (Adobe multiplies this by the _quantity)
            
            PRODUCTS_eVar13 Days from today to ship, ex 0=today, 1=tomorrow
            PRODUCTS_eVar26 Savings Percent 
            PRODUCTS_eVar28 Substitute (Product 2) Sku shown for out-of-stock Product 1 (this is a Product 1 only property)
            PRODUCTS_eVar29 Shown As Alternate (this is a Product 2 only property)
            PRODUCTS_eVar34 <Competitive intensity>, also eVar34, from meta tag productCompetitiveIntensity
            PRODUCTS_eVar40 <Availability>, also eVar40, from meta tag ProductAvailability
            
            Post Peak Tasks for Jan 2024, after 7.24 is released
            1. Rewire the product/quantity/price as needed to pull from (new) meta-tags
            2. Rewrite all the _eVar13 thru _eVar49s to use new meta-tag values
            3. Do same for Lists page view
            
            */
            // var strgShowNewProductPage = b['meta.showNewProductPage'] + '';
            // var showNewProductPage = strgShowNewProductPage.toLowerCase().indexOf('false') >= 0 ? false : !! strgShowNewProductPage;
            var productModel = view.model.get('productModel');
            var catalogModel = productModel.get('catalogModel');
            var substituteVintage = catalogModel.get('substituteVintage');
            var isPreSale = catalogModel.get('isPreSale');
            var substitute_sku = substituteVintage.get('id') || '';
            var hasSubstitute = catalogModel.get('hasSubstitute') || false;
            var subVintage = substituteVintage.get('vintage');
            var hasActualSubstitute = hasSubstitute && subVintage > 0;
            var productStock = catalogModel.get('stock');
    
            try {
                // Start Ecom based tracking. Re-enable new metatag mappings  when 7.24 goes to Production
                b['googleAnalyticsAction'] = 'detail';
                b['pipDetailView'] = true;
                var userSegments = window.tealiumUtils.getUserSegments();
    
                // 
                // PRODUCTS_id
                const products_id_array = [];
                var product_sku = b['meta.pProductID'];
    
                products_id_array.push(product_sku);
    
    
    
                // PRODUCTS_quantity
                // We've never had a quantity meta-tag
                const products_quantity_array = [];
                
                // FUTURE let product_quantity = b['meta.productMinQuantity'] || '1';
                let product_quantity = view.model.get('productModel').get('catalogModel').get('quantityIncrement');
                product_quantity = Number(product_quantity);
                product_quantity = product_quantity > 0 ? product_quantity : 1;
    
                let substitute_minQuantity = 1;
                var substituteIncrement = substituteVintage.get('quantityIncrement');
                // Quantities generated by C# service default to 0
                // But the real world default is 1
                substitute_minQuantity = substituteIncrement > 0 ? substituteIncrement : substitute_minQuantity;
                // If Product has no Substitute Vintage, do not populate the meta-tag
                substitute_minQuantity = hasActualSubstitute ? substitute_minQuantity : '';
                let subQuantity = 1;
                // Quantities generated by C# service default to 0
                // But the real world default is 1
                subQuantity = substituteIncrement > 0 ? substituteIncrement : subQuantity;
                // If Product has no Substitute Vintage, do not populate the meta-tag
                var substitute_quantity =  hasActualSubstitute ? subQuantity : '';
                
                products_quantity_array.push(product_quantity);
                
                
                // PRODUCTS_price
                const products_price_array = [];
                let product_Price = b['meta.productPrice'] || '0';
                product_Price = Number(product_Price.replace('$', '') );
                
                var substituteVintageSalePrice = substituteVintage.get('salePrice');
                let substitute_salePrice = substituteVintageSalePrice.attributes ? substituteVintageSalePrice.get('display') : '';
                substitute_salePrice = Number(substitute_salePrice.replace('$',''))
    
                products_price_array.push(product_Price);
                
                
                // products_eVar102 allowDiscount
                const products_allowDiscounts_array = [];
                let product_allowDiscount = catalogModel.get('allowDiscount') || 'false';
                product_allowDiscount = product_allowDiscount === false ? 'false' : product_allowDiscount;
                products_allowDiscounts_array.push(product_allowDiscount);
                
                
                if( hasActualSubstitute ) {
                    let substitute_allowDiscount = substituteVintage.get('allowDiscount') || 'false';
                    substitute_allowDiscount = substitute_allowDiscount === false ? 'false' : substitute_allowDiscount;
                    products_allowDiscounts_array.push(substitute_allowDiscount);
                }
                
                
                // PRODUCTS_eVar13 days to ship
                const products_days_array = [];
                // const product_daysToShip = showNewProductPage ? 
                // window.tealiumUtils.getDaysFromTodayToShip({catalogModel,hasActualSubstitute,isPreSale,substituteVintage}) 
                // : window.tealiumUtils.getDaysFromTodayToShipOld({catalogModel,hasActualSubstitute,substituteVintage});
                const product_daysToShip = window.tealiumUtils.getDaysFromTodayToShip({catalogModel,hasActualSubstitute,isPreSale,substituteVintage});
                
                
                let substitute_daysToShip = '';
                if( hasActualSubstitute ) {
                    // substitute_daysToShip = showNewProductPage ? 
                    // window.tealiumUtils.getDaysFromTodayToShip({catalogModel,hasActualSubstitute,isPreSale,substituteVintage,useAlt:true}) 
                    // : window.tealiumUtils.getDaysFromTodayToShipOld({catalogModel,hasActualSubstitute,substituteVintage,useAlt:true});
                    substitute_daysToShip = window.tealiumUtils.getDaysFromTodayToShip({catalogModel,hasActualSubstitute,isPreSale,substituteVintage,useAlt:true});
                }
                
                products_days_array.push(product_daysToShip);
                
    
                // PRODUCTS_eVar26 savings percents
                const products_savingsPct_array = [];
                let productSavingsPercentage = catalogModel.get('savingsPercentage') || '0';
                // Convert to string because Tealium ignores zeroes
                productSavingsPercentage = productSavingsPercentage  + '';
                // Do not pass savings percent for out-of-stock item
                productSavingsPercentage = productStock > 0 ? productSavingsPercentage : '';
    
                let substitute_savingsPct = '0';
                if (hasActualSubstitute) {
                    // Do not trust this value, we are getting false zeros, see https://qwww.wine.com/product/faust-cabernet-sauvignon-2018/677554
                    // substitute_savingsPct = substituteVintage.get('savingsPercentage') || 0;
                    // substitute_savingsPct = Number(substitute_savingsPct) > 0 ? substitute_savingsPct + '%' : '';
                    let substituteVintageRegularPrice  = substituteVintage.get('regularPrice');
                    var intSubstituteRegularPrice = Number(substituteVintageRegularPrice.get('display').replace('$',''));
                    
                    let substituteVintageSalePrice = substituteVintage.get('salePrice');
                    var intSubstituteVintageSalePrice = Number(substituteVintageSalePrice.get('display').replace('$',''));
    
                    if (intSubstituteVintageSalePrice < intSubstituteRegularPrice) {
                        let pctSavings = intSubstituteVintageSalePrice / intSubstituteRegularPrice;
                        pctSavings = parseInt((1 - pctSavings) * 100);
                        substitute_savingsPct = pctSavings  + '';
                    }  else if (intSubstituteVintageSalePrice >= intSubstituteRegularPrice) {
                        substitute_savingsPct = '0'; //discard negative or false percentages
                    }
                }
    
                products_savingsPct_array.push(productSavingsPercentage);
                
    
    
                // PRODUCTS_evar28 idOfAlternateShown
                // Product 1 only property
                const idOfAlternateShown_array = []
                if (hasActualSubstitute) {
                    idOfAlternateShown_array.push(substitute_sku);
                }
    
    
    
                // PRODUCTS_eVar29 Shown As Alternate: boolean, false for Product 1, true for Product 2
                shownAsAlternate_array = ['false'];
    
    
    
                // PRODUCTS_eVar34
                const competitiveIntensity_array = [];
                var productAttributes = catalogModel.get('productAttributes') || [];
                let competitiveIntensity = productAttributes.find(attribute => attribute.shortName.indexOf('C/I') >= 0);
                var productIntensity = competitiveIntensity ? competitiveIntensity.shortName : '';
    
                let substitute_intensity = '';
                if(hasActualSubstitute) {
                    var subPA = substituteVintage.get('productAttributes');
                    var subCI = subPA.find(attribute => attribute.shortName.indexOf('C/I') >= 0);
                     substitute_intensity = subCI ? subCI.shortName : '';
                }
                
                competitiveIntensity_array.push(productIntensity);
                
                
                // PRODUCTS_eVar40
                const products_availability_array = [];
                var productAvailability = b['meta.ProductAvailability'] || '';
                var substitute_availability = 'In Stock';
                var subStock = substituteVintage.get('stock');
                var subLastCall = substituteVintage.get('isLastCall');
                
                if (subStock === 0) {
                    // substitute_availability = 'Out of Stock';
                    substitute_availability = '';
                } else if (subLastCall) {
                    substitute_availability = substitute_availability + ' - Last Call';
                }
                
                products_availability_array.push(productAvailability);
                
                
                // If hasActualSubstitute, push the product 2 values
                // These are Product 2 values
                // When track 2 products, any single value array is shared to both. Push '' into a product that should not get that property.
                if (hasActualSubstitute) {
                    products_id_array.push(substitute_sku);                    // PRODUCTS_id
                    products_quantity_array.push(substitute_quantity);         // PRODUCTS_quantity
                    products_price_array.push(substitute_salePrice);           // PRODUCTS_price
                    products_days_array.push(substitute_daysToShip);           // PRODUCTS_eVar13
                    products_savingsPct_array.push(substitute_savingsPct);     // PRODUCTS_eVar26
                    idOfAlternateShown_array.push('');                         // PRODUCTS_eVar28 (clears from Product 2, if there is a Product 2)
                    shownAsAlternate_array.push('true');                       // PRODUCTS_eVar29
                    competitiveIntensity_array.push(substitute_intensity);     // PRODUCTS_eVar34
                    products_availability_array.push(substitute_availability); // PRODUCTS_eVar40
                }
                
                const searchResultViewed = window.tealiumUtils.checkSRV() || false;
                
                
                // Get Displayed Eligible Badge
                //   Copied from ecombaseUtils.getDisplayedEligibleBadge()
                const products_assignedBadgeName_array = [];
                const allowedBadges = window.view.storefrontModel.get('productBadges');
                const eligibleBadges = catalogModel.get('eligibleBadges');
                const isLastCall = catalogModel.get('isLastCall');
                let badge = {'badgeName': ""};
                
                try {
                    
                    for (const allowedBadge of allowedBadges) {
                        const eligibleBadge = eligibleBadges.find((eligibleBadge) => {
                            // Per Product no fallback at all. Just match on the first eligible badge.
                            // && allowedBadge.displayBadge. 
                            return eligibleBadge.badgeName === allowedBadge.badgeName;
                        });
                
                        if (eligibleBadge) {
                            badge = allowedBadge;
                            break;
                        }
                    }
    
                    products_assignedBadgeName_array.push(badge.badgeName);
                } catch (e) {
                    console.error('An error occurred getting PIP view priority badge', e);
                }
    
                // Adobe & Google Tracking
                utag.view({
                    googleAnalyticsAction: b['googleAnalyticsAction'],
                    pipDetailView: b['pipDetailView'],
                    userSegments: userSegments,
                    
                    pipView_product_sku: products_id_array,
                    pipView_product_quantity: products_quantity_array,
                    pipView_product_price: products_price_array,
    
            
                    //Map to 13
                    products_daysToShip: products_days_array,
                    
                    // Map to 26 
                    products_savingsPercent: products_savingsPct_array,
                    
                    // Map to 28 product only
                    products_idOfAlternateShown: idOfAlternateShown_array,
                    
                    // Map to 29 substitute only, boolean was an alternate product
                    products_shownAsAlternate: shownAsAlternate_array,
                    
                    // Map to 34 Competitive Intensity
                    products_competitiveIntensity: competitiveIntensity_array,
                    
                    // Map to 40 Availability
                    products_availability: products_availability_array,
                    
                    // Map to 102
                    products_allowDiscounts: products_allowDiscounts_array,
                    
                    products_enablePremiumContent: b['meta.enablePremiumContent'],
                    pip_enablePremiumContent: b['meta.enablePremiumContent'],
                    
                    products_assignedBadgeName: products_assignedBadgeName_array,
                    
                    searchResultViewed
                    
                    
                }, null, [78, 123]);
                // 78: Google Universal Analytics
                // 123: Adobe
            
            } catch (e) {
                console.error('Adobe Product tracking error, ', e);
            }
            // END Original method, untouched
            
            
        }
    }
}
