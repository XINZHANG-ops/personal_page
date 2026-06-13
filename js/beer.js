// Beer scoring data and functionality
(function () {
    'use strict';

    // Beer data structure
    // This file is AUTO-GENERATED from data/beer.jsonl
    // To add new beers, use: python add_beer.py
    // Then rebuild with: npm run build-beer
    const beers = [
    {
        "id": "wellington-helles-lager",
        "name": "Wellington Helles Lager",
        "style": "Lager",
        "abv": 4.5,
        "date": "2026-01-07",
        "price": 3.65,
        "imageUrl": "../assets/images/beers/wellington-helles-lager.jpg?v=0a0b6c9",
        "notes": "I don't really like this flavor. When I first drink it, there's an ale-like taste that I don't enjoy. Although a malty aroma comes through after a while, it isn't very strong.",
        "scores": {
            "maltiness": 3,
            "colorDepth": 3,
            "clarity": 9.5,
            "bitterness": 6.5,
            "otherAromas": 5,
            "overall": 4
        }
    },
    {
        "id": "carlsberg-lite",
        "name": "Carlsberg Lite",
        "style": "Lager",
        "abv": 4,
        "date": "2026-01-07",
        "price": 3.05,
        "imageUrl": "../assets/images/beers/carlsberg-lite.jpg?v=0a0b6c9",
        "notes": "It's not a flavor I like either. On the first sip, there's a burnt or scorched taste. To be precise, it doesn't really feel like a lager, and there's almost no malt flavor at all.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 3.5,
            "clarity": 9.5,
            "bitterness": 5.5,
            "otherAromas": 7.5,
            "overall": 3
        }
    },
    {
        "id": "grolsch-premium-pilsner",
        "name": "Grolsch Premium Pilsner",
        "style": "Pilsner",
        "abv": 5,
        "date": "2026-01-07",
        "price": 2.75,
        "imageUrl": "../assets/images/beers/grolsch-premium-pilsner.jpg?v=0a0b6c9",
        "notes": "It's hard to describe. There is a malty aroma, but the first sip is very bitter, followed by a strong alcoholic note. Only after that do I start to perceive the malt aroma through the nose.",
        "scores": {
            "maltiness": 6,
            "colorDepth": 5.5,
            "clarity": 9.5,
            "bitterness": 9.5,
            "otherAromas": 3,
            "overall": 6
        }
    },
    {
        "id": "czechvar-premium-lager",
        "name": "Czechvar Premium Lager",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-07",
        "price": 3.2,
        "imageUrl": "../assets/images/beers/czechvar-premium-lager.jpg?v=0a0b6c9",
        "notes": "The first sip feels quite bitter and refreshing, with a slight ale-like character. There's almost no malt aroma. Honestly, the flavor doesn't stand out at all—it feels pretty plain and unremarkable. Something intereting is the can is golden color.",
        "scores": {
            "maltiness": 2.5,
            "colorDepth": 4,
            "clarity": 9.5,
            "bitterness": 8.5,
            "otherAromas": 2,
            "overall": 4
        }
    },
    {
        "id": "hoegaarden-original-belgian-wheat",
        "name": "Hoegaarden Original Belgian Wheat",
        "style": "Wheat Beer",
        "abv": 4.9,
        "date": "2026-01-08",
        "price": 3.7,
        "imageUrl": "../assets/images/beers/hoegaarden-original-belgian-wheat.jpg?v=0a0b6c9",
        "notes": "This tastes like the wheat beer you'd get at Haidilao back in China. It has some orange peel notes, but they're not very strong. There's a touch of sweetness, though not the kind that comes from added sugar. Although it's not a malt-forward style of beer, overall it's not my favorite type—but it's still quite good.",
        "scores": {
            "maltiness": 1.5,
            "colorDepth": 9.5,
            "clarity": 2.5,
            "bitterness": 1.5,
            "otherAromas": 9,
            "overall": 8.5
        }
    },
    {
        "id": "lwenbru",
        "name": "Löwenbräu",
        "style": "Lager",
        "abv": 5.2,
        "date": "2026-01-08",
        "price": 2.55,
        "imageUrl": "../assets/images/beers/lwenbru.jpg?v=0a0b6c9",
        "notes": "The first sip is very crisp and refreshing, with a slightly sharp, peppery bite. This is followed by a lingering bitterness at the back of the tongue. Overall, the flavor is quite light, without any particularly noticeable aroma.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 7.5,
            "otherAromas": 1.5,
            "overall": 6
        }
    },
    {
        "id": "left-field-brewery-leafs-lager",
        "name": "Left Field Brewery Leafs Lager",
        "style": "Lager",
        "abv": 4.2,
        "date": "2026-01-08",
        "price": 3.85,
        "imageUrl": "../assets/images/beers/left-field-brewery-leafs-lager.jpg?v=0a0b6c9",
        "notes": "There isn’t much flavor on the first sip—it's light and almost watery, but still quite crisp. After it passes through the nose, there’s a clean, subtle aroma. It’s not particularly distinctive, but it’s solid and well-balanced.",
        "scores": {
            "maltiness": 5,
            "colorDepth": 9.5,
            "clarity": 9.5,
            "bitterness": 2,
            "otherAromas": 2,
            "overall": 6.5
        }
    },
    {
        "id": "kronenbourg-1664-lager",
        "name": "kronenbourg 1664 lager",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-09",
        "price": 3.4,
        "imageUrl": "../assets/images/beers/kronenbourg-1664-lager.jpg?v=0a0b6c9",
        "notes": "Kronenbourg 1664 Lager tastes fairly standard. It’s crisp on the first sip, slightly bitter, with no noticeable lingering aroma. There’s only a very faint malty aftertaste. Personally, I feel its value for money is just average.",
        "scores": {
            "maltiness": 4,
            "colorDepth": 7.5,
            "clarity": 9.5,
            "bitterness": 4.5,
            "otherAromas": 3,
            "overall": 6
        }
    },
    {
        "id": "nickel-brook-naughty-neighbor-pale-ale",
        "name": "Nickel Brook Naughty Neighbor Pale Ale",
        "style": "Pale Ale",
        "abv": 4.9,
        "date": "2026-01-09",
        "price": 3.45,
        "imageUrl": "../assets/images/beers/nickel-brook-naughty-neighbor-pale-ale.jpg?v=0a0b6c9",
        "notes": "The first sip has a clearly ale-like character and is fairly bitter. After that, a subtle tea-like aroma comes through on the nose. This one has a bit of lemon added, so the “tea-like” note may actually be lemon aroma. For someone like me who doesn’t usually like ales, that hint of lingering tea-like (or lemony) aroma adds a bit to the experience.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 9,
            "clarity": 2,
            "bitterness": 8,
            "otherAromas": 7.5,
            "overall": 7
        }
    },
    {
        "id": "cowbell-brewing-co-smooth-sailing-light-lager",
        "name": "Cowbell Brewing Co. Smooth Sailing Light Lager",
        "style": "Lager",
        "abv": 4,
        "date": "2026-01-09",
        "price": 3.5,
        "imageUrl": "../assets/images/beers/cowbell-brewing-co-smooth-sailing-light-lager.jpg?v=0a0b6c9",
        "notes": "On the first sip, there’s a faint, hard-to-describe flavor—neither clearly good nor bad. Then there’s a slight sourness, followed by some malty notes in the aftertaste. I suspect the malt stands out mainly because the overall flavor is quite light.",
        "scores": {
            "maltiness": 6.5,
            "colorDepth": 8.5,
            "clarity": 9,
            "bitterness": 1.5,
            "otherAromas": 4,
            "overall": 6
        }
    },
    {
        "id": "mill-street-original-organic",
        "name": "Mill Street Original Organic",
        "style": "Lager",
        "abv": 4.2,
        "date": "2026-01-09",
        "price": 3.39,
        "imageUrl": "../assets/images/beers/mill-street-original-organic.jpg?v=0a0b6c9",
        "notes": "The first sip has a mild bitterness with a slightly burnt note. Overall, the flavor stays quite consistent throughout, and the mouthfeel is fairly smooth.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 6.5,
            "clarity": 9.5,
            "bitterness": 2,
            "otherAromas": 4,
            "overall": 5
        }
    },
    {
        "id": "molson-cold-shots-max",
        "name": "Molson Cold Shots Max",
        "style": "Other",
        "abv": 7.1,
        "date": "2026-01-10",
        "price": 2.59,
        "imageUrl": "../assets/images/beers/molson-cold-shots-max.jpg?v=0a0b6c9",
        "notes": "Being a higher-ABV beer, you can immediately sense the alcohol on the nose on the first sip. It has a bitter, slightly astringent character, followed by a faint aroma. Personally, I’m not particularly fond of high-alcohol beers. Shots type of beer.",
        "scores": {
            "maltiness": 4.5,
            "colorDepth": 6.5,
            "clarity": 9.5,
            "bitterness": 5.5,
            "otherAromas": 2.5,
            "overall": 5
        }
    },
    {
        "id": "coors-light",
        "name": "Coors Light",
        "style": "Lager",
        "abv": 4,
        "date": "2026-01-10",
        "price": 2.69,
        "imageUrl": "../assets/images/beers/coors-light.jpg?v=0a0b6c9",
        "notes": "The first sip has a metallic note, followed by a faint aroma. Aside from that unusual initial taste, the rest of the flavors are very subdued.",
        "scores": {
            "maltiness": 5.5,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 2,
            "otherAromas": 2,
            "overall": 7
        }
    },
    {
        "id": "great-lakes-lager",
        "name": "GREAT LAKES LAGER",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-10",
        "price": 2.57,
        "imageUrl": "../assets/images/beers/great-lakes-lager.jpg?v=0a0b6c9",
        "notes": "The first sip has a mildly bitter, metallic note with a sharp, prickly edge. This is followed by a sensation that I’m not entirely sure about—possibly something related to fermentation.",
        "scores": {
            "maltiness": 3,
            "colorDepth": 5.5,
            "clarity": 9.5,
            "bitterness": 4,
            "otherAromas": 4,
            "overall": 5
        }
    },
    {
        "id": "cowbell-brewing-co-shindig-lager",
        "name": "Cowbell Brewing Co. Shindig Lager",
        "style": "Lager",
        "abv": 4.5,
        "date": "2026-01-10",
        "price": 3.5,
        "imageUrl": "../assets/images/beers/cowbell-brewing-co-shindig-lager.jpg?v=0a0b6c9",
        "notes": "Although it’s labeled as a lager, it drinks entirely like an ale. The mouthfeel is somewhat fuller, with a smooth, almost creamy texture.",
        "scores": {
            "maltiness": 2.5,
            "colorDepth": 7,
            "clarity": 7.5,
            "bitterness": 5,
            "otherAromas": 3,
            "overall": 4.5
        }
    },
    {
        "id": "warsteiner-premium-pilsener",
        "name": "Warsteiner Premium Pilsener",
        "style": "Pilsner",
        "abv": 4.8,
        "date": "2026-01-11",
        "price": 2.95,
        "imageUrl": "../assets/images/beers/warsteiner-premium-pilsener.jpg?v=0a0b6c9",
        "notes": "The first sip is dominated by a fairly strong bitterness along with a sharp, prickly sensation from the carbonation. The aftertaste is also slightly bitter, with no other particularly distinctive flavors.",
        "scores": {
            "maltiness": 4,
            "colorDepth": 6,
            "clarity": 9.5,
            "bitterness": 8,
            "otherAromas": 2,
            "overall": 4.5
        }
    },
    {
        "id": "hofbrau-original-lager",
        "name": "Hofbrau Original Lager",
        "style": "Lager",
        "abv": 5.1,
        "date": "2026-01-11",
        "price": 3.95,
        "imageUrl": "../assets/images/beers/hofbrau-original-lager.jpg?v=0a0b6c9",
        "notes": "The flavor is also on the bitter side at the first sip, with a fleeting, subtle note that’s hard to describe—possibly from the yeast. Overall, bitterness is the dominant characteristic.",
        "scores": {
            "maltiness": 3,
            "colorDepth": 5.5,
            "clarity": 9.5,
            "bitterness": 7.5,
            "otherAromas": 4,
            "overall": 5.5
        }
    },
    {
        "id": "kostritzer-edel-pils",
        "name": "Kostritzer Edel Pils",
        "style": "Pilsner",
        "abv": 4.8,
        "date": "2026-01-11",
        "price": 2.55,
        "imageUrl": "../assets/images/beers/kostritzer-edel-pils.jpg?v=0a0b6c9",
        "notes": "On the first sip, there’s a slightly herbal note. I’m not sure if it’s influenced by the spicy chicken wings from Wild Wing that I was eating at the same time, but there’s a kind of herbal bitterness that feels a bit different.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 7.5,
            "clarity": 9.5,
            "bitterness": 7.5,
            "otherAromas": 5,
            "overall": 4.5
        }
    },
    {
        "id": "harp-lager",
        "name": "Harp Lager",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-11",
        "price": 3.45,
        "imageUrl": "../assets/images/beers/harp-lager.jpg?v=0a0b6c9",
        "notes": "Although the first sip is quite bitter, it’s followed by a subtle sweetness. There’s a certain refined, hard-to-define sense of quality to the mouthfeel, even though the overall flavor isn’t exactly my favorite.",
        "scores": {
            "maltiness": 5,
            "colorDepth": 7,
            "clarity": 10,
            "bitterness": 7,
            "otherAromas": 2.5,
            "overall": 7
        }
    },
    {
        "id": "hacker-pschorr-munich-gold-lager",
        "name": "Hacker Pschorr Munich Gold Lager",
        "style": "Lager",
        "abv": 5.5,
        "date": "2026-01-12",
        "price": 2.85,
        "imageUrl": "../assets/images/beers/hacker-pschorr-munich-gold-lager.jpg?v=0a0b6c9",
        "notes": "Slightly bitter, with the alcohol aroma quickly reaching the nose. Overall, it feels crisp and carbonated with a mild bitterness, finishing with just a hint of malt.",
        "scores": {
            "maltiness": 5,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 6,
            "otherAromas": 1.5,
            "overall": 5.5
        }
    },
    {
        "id": "amsterdam-blonde-lager",
        "name": "Amsterdam Blonde Lager",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-12",
        "price": 3.6,
        "imageUrl": "../assets/images/beers/amsterdam-blonde-lager.jpg?v=0a0b6c9",
        "notes": "The first sip has an egg-like note—though I’m not entirely sure—but it does feel distinctly different. It seems like an unusual hop character, which is the most distinctive aspect of this beer. The mouthfeel is fairly round, with noticeable carbonation.",
        "scores": {
            "maltiness": 3,
            "colorDepth": 7,
            "clarity": 9.5,
            "bitterness": 3.5,
            "otherAromas": 7,
            "overall": 6
        }
    },
    {
        "id": "kingfisher-lager",
        "name": "Kingfisher Lager",
        "style": "Lager",
        "abv": 4.5,
        "date": "2026-01-12",
        "price": 2.7,
        "imageUrl": "../assets/images/beers/kingfisher-lager.jpg?v=0a0b6c9",
        "notes": "Putting the beer itself aside for a moment, the blue bird design on the bottle cap has a lot of emotional appeal. In terms of flavor, it has a fairly classic bitterness—not the kind of beer you’d want to keep drinking once you’re a bit tipsy, as it can start to feel uncomfortable. Other notes are said to include corn and barley, but I’m not very sensitive to those flavors and mostly just perceive a slight bitterness. Although I don’t particularly enjoy the taste, the blue bird definitely adds a few points for me.",
        "scores": {
            "maltiness": 1.5,
            "colorDepth": 4.5,
            "clarity": 9.5,
            "bitterness": 7,
            "otherAromas": 2.5,
            "overall": 5
        }
    },
    {
        "id": "zywiec-beer",
        "name": "ZYWIEC BEER",
        "style": "Lager",
        "abv": 5.5,
        "date": "2026-01-12",
        "price": 2.52,
        "imageUrl": "../assets/images/beers/zywiec-beer.jpg?v=0a0b6c9",
        "notes": "To be honest, it’s that familiar combination of bitterness and hop flavor again. After the first sip, the alcohol aroma hits the nose right away, which I don’t like.",
        "scores": {
            "maltiness": 4,
            "colorDepth": 6.5,
            "clarity": 9.5,
            "bitterness": 5,
            "otherAromas": 1.5,
            "overall": 4.5
        }
    },
    {
        "id": "budweiser",
        "name": "BUDWEISER",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-13",
        "price": 2.79,
        "imageUrl": "../assets/images/beers/budweiser.jpg?v=0a0b6c9",
        "notes": "Budweiser is one of the few lagers in Canada that I actually find quite pleasant. There’s just a hint of bitterness on the first sip, which fades quickly, followed by a light malty aftertaste. Although it’s not very pronounced, it’s still one of the more drinkable and acceptable beers for me here.",
        "scores": {
            "maltiness": 7.5,
            "colorDepth": 7.5,
            "clarity": 9.5,
            "bitterness": 3,
            "otherAromas": 1.5,
            "overall": 8
        }
    },
    {
        "id": "innis-gunn-lager",
        "name": "INNIS & GUNN LAGER",
        "style": "Lager",
        "abv": 4.6,
        "date": "2026-01-13",
        "price": 2.29,
        "imageUrl": "../assets/images/beers/innis-gunn-lager.jpg?v=0a0b6c9",
        "notes": "This one actually tastes quite different. There’s a touch of hop character at first, followed by an herbal note with a bit of sweetness. As it goes down, the aroma reaching the nose also has a distinctly medicinal, herbal quality. It’s quite unique.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 6.5,
            "clarity": 9.5,
            "bitterness": 3,
            "otherAromas": 7,
            "overall": 6
        }
    },
    {
        "id": "burdock-brewery-deluxe",
        "name": "Burdock Brewery Deluxe",
        "style": "Lager",
        "abv": 4.5,
        "date": "2026-01-14",
        "price": 4.5,
        "imageUrl": "../assets/images/beers/burdock-brewery-deluxe.jpg?v=0a0b6c9",
        "notes": "It has a fairly typical first impression, with that initial hop-driven hit. What sets this one apart is the mid-palate, where there’s a pleasantly sweet, malty aroma that’s noticeably richer than in most of the beers I’ve tasted, which earns it quite a few extra points.",
        "scores": {
            "maltiness": 6.5,
            "colorDepth": 7,
            "clarity": 9.5,
            "bitterness": 4.5,
            "otherAromas": 2,
            "overall": 7
        }
    },
    {
        "id": "prince-eddys-dunkle-lager",
        "name": "Prince Eddy's Dunkle Lager",
        "style": "Lager",
        "abv": 4.5,
        "date": "2026-01-14",
        "price": 3.85,
        "imageUrl": "../assets/images/beers/prince-eddys-dunkle-lager.jpg?v=0a0b6c9",
        "notes": "It tastes pretty much like what you’d expect from a dark lager: there’s a burnt, caramelized note on the first sip, and the overall flavor is quite heavy. I’m not particularly fond of this style.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 2,
            "clarity": 9.5,
            "bitterness": 3.5,
            "otherAromas": 5.5,
            "overall": 3.5
        }
    },
    {
        "id": "sneaky-weasel-lager",
        "name": "SNEAKY WEASEL LAGER",
        "style": "Lager",
        "abv": 5.6,
        "date": "2026-01-14",
        "price": 1.75,
        "imageUrl": "../assets/images/beers/sneaky-weasel-lager.jpg?v=0a0b6c9",
        "notes": "After the first sip, there’s a very strong fermented yeast note, along with what seems like a corn-like flavor. After tasting it a few more times, it really comes across as an intense yeast character. Beyond that, there isn’t much of an after-aroma to speak of.",
        "scores": {
            "maltiness": 3,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 3,
            "otherAromas": 5,
            "overall": 4
        }
    },
    {
        "id": "molson-canadian",
        "name": "MOLSON CANADIAN",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-14",
        "price": 2.69,
        "imageUrl": "../assets/images/beers/molson-canadian.jpg?v=0a0b6c9",
        "notes": "After taking a sip, there’s just a trace of bitterness, followed by a faint hint of malt—both are barely noticeable. It’s certainly very clean and clear, but it also truly doesn’t have much flavor.",
        "scores": {
            "maltiness": 5.5,
            "colorDepth": 7.5,
            "clarity": 9.5,
            "bitterness": 3,
            "otherAromas": 1.5,
            "overall": 6.5
        }
    },
    {
        "id": "moosehead-lager",
        "name": "MOOSEHEAD LAGER",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-15",
        "price": 2.69,
        "imageUrl": "../assets/images/beers/moosehead-lager.jpg?v=0a0b6c9",
        "notes": "This green-bottle Moose has a noticeably strong alcohol presence on the first sip. It doesn’t feel light enough, and the malt aroma isn’t very pronounced, but overall it’s still acceptable.",
        "scores": {
            "maltiness": 6,
            "colorDepth": 7,
            "clarity": 9.5,
            "bitterness": 2,
            "otherAromas": 2,
            "overall": 6.5
        }
    },
    {
        "id": "busch-light",
        "name": "Busch Light",
        "style": "Lager",
        "abv": 4,
        "date": "2026-01-15",
        "price": 2.55,
        "imageUrl": "../assets/images/beers/busch-light.jpg?v=0a0b6c9",
        "notes": "It tastes almost flavorless—there’s no real bitterness, sweetness, or aroma, just a very faint, basic taste. Perhaps it’s only in this overall light, muted profile that a slight hint of malt can be perceived.",
        "scores": {
            "maltiness": 9,
            "colorDepth": 7.5,
            "clarity": 9.5,
            "bitterness": 1,
            "otherAromas": 1,
            "overall": 9
        }
    },
    {
        "id": "lezajsk-beer",
        "name": "Lezajsk Beer",
        "style": "Lager",
        "abv": 5.3,
        "date": "2026-01-15",
        "price": 2.9,
        "imageUrl": "../assets/images/beers/lezajsk-beer.jpg?v=0a0b6c9",
        "notes": "It has that medicinal, herbal-liquor kind of flavor again. It tastes bitter as soon as you drink it, followed by a lingering, consistently bitter herbal note.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 6.5,
            "clarity": 9.5,
            "bitterness": 6,
            "otherAromas": 3,
            "overall": 3.5
        }
    },
    {
        "id": "crest-super-lager",
        "name": "Crest Super Lager",
        "style": "Lager",
        "abv": 10,
        "date": "2026-01-15",
        "price": 4.25,
        "imageUrl": "../assets/images/beers/crest-super-lager.jpg?v=0a0b6c9",
        "notes": "It’s definitely a high-ABV beer. I’m not sure why, but it actually feels harsher than wine at a similar alcohol level. There’s no bitterness at all on the first sip—instead, it’s quite sweet, there’s even a hint reminiscent of rice wine, followed by a strong alcohol presence. If you’re just looking for that dizzy, buzzed feeling rather than any particular flavor, this one would do the job.",
        "scores": {
            "maltiness": 1.5,
            "colorDepth": 6,
            "clarity": 9.5,
            "bitterness": 1.5,
            "otherAromas": 1.5,
            "overall": 5
        }
    },
    {
        "id": "amsterdam-3-speed-lager",
        "name": "Amsterdam 3 Speed Lager",
        "style": "Lager",
        "abv": 4.2,
        "date": "2026-01-16",
        "price": 3.6,
        "imageUrl": "../assets/images/beers/amsterdam-3-speed-lager.jpg?v=0a0b6c9",
        "notes": "This has a classic light beer profile. It’s crisp on the first sip, followed by a subtle malty aftertaste. Overall, it’s quite a pleasant beer.",
        "scores": {
            "maltiness": 8,
            "colorDepth": 9,
            "clarity": 9.5,
            "bitterness": 1.5,
            "otherAromas": 1.5,
            "overall": 8.5
        }
    },
    {
        "id": "laker-lager",
        "name": "Laker Lager",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-16",
        "price": 1.9,
        "imageUrl": "../assets/images/beers/laker-lager.jpg?v=0a0b6c9",
        "notes": "The blue-bottle Lake Lager is something I regularly choose for everyday drinking. Given its low price and light flavor, it has a slightly bitter edge on the first sip along with a crisp mouthfeel, followed by a noticeable touch of malt aroma.",
        "scores": {
            "maltiness": 8,
            "colorDepth": 7.5,
            "clarity": 9.5,
            "bitterness": 3.5,
            "otherAromas": 1.5,
            "overall": 8
        }
    },
    {
        "id": "holsten-premium-pilsner",
        "name": "Holsten Premium Pilsner",
        "style": "Pilsner",
        "abv": 5,
        "date": "2026-01-17",
        "price": 2.75,
        "imageUrl": "../assets/images/beers/holsten-premium-pilsner.jpg?v=0a0b6c9",
        "notes": "Slightly bitter, with a typical Pilsner profile—the bitterness carries through to the nose.",
        "scores": {
            "maltiness": 4,
            "colorDepth": 9,
            "clarity": 9.5,
            "bitterness": 3.5,
            "otherAromas": 1.5,
            "overall": 5
        }
    },
    {
        "id": "michelob-ultra-can",
        "name": "Michelob Ultra Can",
        "style": "Lager",
        "abv": 4,
        "date": "2026-01-18",
        "price": 2.99,
        "imageUrl": "../assets/images/beers/michelob-ultra-can.jpg?v=0a0b6c9",
        "notes": "Michelob Ultra (can) is a very light beer but still has some malt aroma. On the first sip, I might have imagined a faint baijiu-like note, but after that it’s mostly just clean, light, and malty. I actually like it quite a bit—though I can see how people who dislike very light beers might really not enjoy it, since it’s genuinely quite mild.",
        "scores": {
            "maltiness": 8.5,
            "colorDepth": 9.5,
            "clarity": 9.5,
            "bitterness": 1,
            "otherAromas": 1,
            "overall": 7.5
        }
    },
    {
        "id": "bud-light",
        "name": "Bud Light",
        "style": "Lager",
        "abv": 4,
        "date": "2026-01-18",
        "price": 2.79,
        "imageUrl": "../assets/images/beers/bud-light.jpg?v=0a0b6c9",
        "notes": "Bud Light has a slight burnt note on the first sip—or maybe what people describe as a bready flavor. Overall it’s very light, but that initial hint of burnt flavor isn’t something I really like. Still, taken as a whole, it’s fairly acceptable.",
        "scores": {
            "maltiness": 7.5,
            "colorDepth": 8.5,
            "clarity": 9.5,
            "bitterness": 1.5,
            "otherAromas": 1,
            "overall": 7
        }
    },
    {
        "id": "blue-moon-belgian-white",
        "name": "BLUE MOON BELGIAN WHITE",
        "style": "Wheat Beer",
        "abv": 5.4,
        "date": "2026-01-18",
        "price": 3.39,
        "imageUrl": "../assets/images/beers/blue-moon-belgian-white.jpg?v=0a0b6c9",
        "notes": "This is also an orange-peel Belgian white beer. Although it’s not my favorite malt-forward style, this type of beer generally suits my taste quite well. It goes down smoothly without being harsh, has a touch of sweetness, and still carries a pleasant beer aroma.",
        "scores": {
            "maltiness": 1.5,
            "colorDepth": 6.5,
            "clarity": 1.5,
            "bitterness": 1.5,
            "otherAromas": 9,
            "overall": 8.5
        }
    },
    {
        "id": "heineken",
        "name": "Heineken",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-18",
        "price": 3.79,
        "imageUrl": "../assets/images/beers/heineken.jpg?v=0a0b6c9",
        "notes": "Heineken actually tastes quite bitter to me—though not extremely so. In my impression, it’s a fairly light beer with a pale color, but the bitterness definitely feels more like hop bitterness rather than the roasted malt kind. I’m not sure whether the Heineken sold in China has been adjusted or modified in any way.",
        "scores": {
            "maltiness": 1.5,
            "colorDepth": 7.5,
            "clarity": 9.5,
            "bitterness": 6,
            "otherAromas": 4,
            "overall": 5
        }
    },
    {
        "id": "carling-ice",
        "name": "Carling Ice",
        "style": "Lager",
        "abv": 5.5,
        "date": "2026-01-19",
        "price": 2.49,
        "imageUrl": "../assets/images/beers/carling-ice.jpg?v=0a0b6c9",
        "notes": "This beer was a pleasant surprise. The first sip has a bit of bitterness—not too much, just enough—and it’s quite crisp. After that, it becomes very aromatic. It’s not purely a malt aroma, but there’s definitely a lot of malt character coming through in the finish.",
        "scores": {
            "maltiness": 8,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 3.5,
            "otherAromas": 2.5,
            "overall": 8
        }
    },
    {
        "id": "dab-original-lager",
        "name": "DAB ORIGINAL LAGER",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-19",
        "price": 2.79,
        "imageUrl": "../assets/images/beers/dab-original-lager.jpg?v=0a0b6c9",
        "notes": "DAB Original Lager tastes like a beer made with roasted malts. There’s a slight burnt note on the first sip, but it’s not heavy and disappears almost immediately. I feel this kind of beer might actually pair quite well with strongly flavored barbecue.",
        "scores": {
            "maltiness": 3,
            "colorDepth": 6.5,
            "clarity": 9.5,
            "bitterness": 5,
            "otherAromas": 4,
            "overall": 5
        }
    },
    {
        "id": "sleeman-clear-20",
        "name": "SLEEMAN CLEAR 2.0",
        "style": "Lager",
        "abv": 4,
        "date": "2026-01-19",
        "price": 2.67,
        "imageUrl": "../assets/images/beers/sleeman-clear-20.jpg?v=0a0b6c9",
        "notes": "Sleeman Clear 2.0 actually tastes a bit like domestic Chinese beers. The first sip is extremely light—just clean and crisp with almost no flavor—followed by a malty note in the finish. Although the malt aroma itself isn’t very strong, it stands out clearly because of how light and refreshing the beer is overall.",
        "scores": {
            "maltiness": 8.5,
            "colorDepth": 8.5,
            "clarity": 9.5,
            "bitterness": 1,
            "otherAromas": 1,
            "overall": 9
        }
    },
    {
        "id": "asahi-super-dry",
        "name": "Asahi Super Dry",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-20",
        "price": 3.39,
        "imageUrl": "../assets/images/beers/asahi-super-dry.jpg?v=0a0b6c9",
        "notes": "Interesting. It’s said to be a Japanese dry lager. On the first sip, there’s a hint of that beer flavor I don’t really like—an extremely faint burnt note, maybe? But I don’t actually find it “spicy” despite the name Karakuchi. After that, there’s a surprisingly strong malty aftertaste, which is quite nice overall.",
        "scores": {
            "maltiness": 8,
            "colorDepth": 7,
            "clarity": 9.5,
            "bitterness": 4,
            "otherAromas": 1.5,
            "overall": 7.5
        }
    },
    {
        "id": "sapporo",
        "name": "SAPPORO",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-20",
        "price": 3.39,
        "imageUrl": "../assets/images/beers/sapporo.jpg?v=0a0b6c9",
        "notes": "With Sapporo, my first sip was actually foam that was about to overflow, so I instinctively took a sip of it. It had a very rich malty aroma. Because of that, my impressions afterward might be a bit biased. That said, when actually drinking it, I didn’t enjoy it as much as the Karakuchi dry version. It feels like it has more of an ale-like character—possibly from the hops—and the malty aftertaste doesn’t come through as strongly as I expected.",
        "scores": {
            "maltiness": 6,
            "colorDepth": 7,
            "clarity": 9.5,
            "bitterness": 3.5,
            "otherAromas": 2,
            "overall": 6.5
        }
    },
    {
        "id": "old-style-pilsner",
        "name": "OLD STYLE PILSNER",
        "style": "Pilsner",
        "abv": 5,
        "date": "2026-01-22",
        "price": 2.49,
        "imageUrl": "../assets/images/beers/old-style-pilsner.jpg?v=0a0b6c9",
        "notes": "This beer has always been one of my go-to choices, and a big reason for that was the price. It was CAD 1.90 at The Beer Store last year, and only CAD 2.10 at Sobeys, but today Sobeys raised the price directly to CAD 2.49. At that price, it’s no longer as attractive as before. In terms of flavor, compared with other pilsners it isn’t very bitter, and there’s still some malt character. The first sip does have bitterness and a dry finish, though.",
        "scores": {
            "maltiness": 7,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 4,
            "otherAromas": 1,
            "overall": 7
        }
    },
    {
        "id": "pabst-blue-ribbon",
        "name": "Pabst Blue Ribbon",
        "style": "Lager",
        "abv": 4.9,
        "date": "2026-01-22",
        "price": 2.49,
        "imageUrl": "../assets/images/beers/pabst-blue-ribbon.jpg?v=0a0b6c9",
        "notes": "Pabst Blue Ribbon is similar to Old Style Pilsner—they’re both styles I used to drink quite often. A big reason was the price: last year it was CAD 1.90 at The Beer Store, and only CAD 2.10 at Sobeys, but today Sobeys has raised it straight to CAD 2.49.\nIn terms of taste, it has a fairly noticeable alcohol presence, and the finish also feels somewhat alcohol-driven. There’s a hint of malt, but it’s not very strong. On the first sip, it doesn’t really come across as particularly dry.",
        "scores": {
            "maltiness": 5.5,
            "colorDepth": 6.5,
            "clarity": 9.5,
            "bitterness": 1,
            "otherAromas": 1,
            "overall": 6.5
        }
    },
    {
        "id": "laker-ice",
        "name": "Laker Ice",
        "style": "Lager",
        "abv": 5.5,
        "date": "2026-01-22",
        "price": 2.49,
        "imageUrl": "../assets/images/beers/laker-ice.jpg?v=0a0b6c9",
        "notes": "Laker beers used to be around two dollars a bottle as well, but prices have really gone up over the past year or two. I drink the blue-label Laker quite often; the black-label Ice version, not as much. On the first sip, there’s a very faint, whiskey-like aroma in the nose, and the finish has a similar note. Even though the alcohol content isn’t high (compared to spirits), it still gives off the impression of a higher-proof drink.",
        "scores": {
            "maltiness": 3.5,
            "colorDepth": 6,
            "clarity": 9.5,
            "bitterness": 3,
            "otherAromas": 1.5,
            "overall": 5
        }
    },
    {
        "id": "cracked-canoe",
        "name": "Cracked Canoe",
        "style": "Lager",
        "abv": 3.5,
        "date": "2026-01-22",
        "price": 2.7,
        "imageUrl": "../assets/images/beers/cracked-canoe.jpg?v=0a0b6c9",
        "notes": "Cracked Canoe is the lowest-ABV beer I’ve had so far. I’m not sure if low alcohol and low calories are now major selling points for beer, but I personally do prefer lower-calorie options. This one is labeled at 130 calories—while most beers are usually around 150 to 200 calories, so it’s not dramatically lower. Still, it does taste quite light. The first sip is very refreshing with a bready note, followed by a clean, light profile and then some malt character. It’s not very intense, but relative to how light the beer is, the malt flavor actually comes through quite nicely.",
        "scores": {
            "maltiness": 8.5,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 1,
            "otherAromas": 1,
            "overall": 8
        }
    },
    {
        "id": "rickards-red",
        "name": "RICKARDS RED",
        "style": "Amber Ale",
        "abv": 5.2,
        "date": "2026-01-23",
        "price": 3.39,
        "imageUrl": "../assets/images/beers/rickards-red.jpg?v=0a0b6c9",
        "notes": "This is my first amber ale, and it was surprisingly quite good. There wasn’t as much bitterness as I expected—the bitterness level is only about the same as an average pilsner. What really stands out instead is the strong malty aroma in the later stages. There’s no noticeable hop flavor at all, and none of the burnt notes that I usually dislike. I was honestly surprised that a beer with such a dark color could taste like this.",
        "scores": {
            "maltiness": 7.5,
            "colorDepth": 2,
            "clarity": 9.5,
            "bitterness": 2,
            "otherAromas": 2,
            "overall": 7.5
        }
    },
    {
        "id": "collective-arts-lager",
        "name": "Collective Arts Lager",
        "style": "Lager",
        "abv": 4.9,
        "date": "2026-01-24",
        "price": 3.25,
        "imageUrl": "../assets/images/beers/collective-arts-lager.jpg?v=0a0b6c9",
        "notes": "This beer has a very pale color, but the first sip is quite intense, with a strong hop character. Overall, the hop flavor is very pronounced. As the foam bursts, it releases some bitterness, and the overall impression is fairly crisp and dry.",
        "scores": {
            "maltiness": 4,
            "colorDepth": 9,
            "clarity": 9.5,
            "bitterness": 5,
            "otherAromas": 4,
            "overall": 5.5
        }
    },
    {
        "id": "waterloo-pineapple-radler",
        "name": "WATERLOO PINEAPPLE RADLER",
        "style": "Lager",
        "abv": 2.5,
        "date": "2026-01-25",
        "price": 3.4,
        "imageUrl": "../assets/images/beers/waterloo-pineapple-radler.jpg?v=0a0b6c9",
        "notes": "Just like the name suggests, this is a pineapple-flavored beer. It has very little alcohol and is quite sweet—drinking it feels more like having a slightly alcoholic soda. It’s fine for times when you don’t really want to drink alcohol, but the sugar content is pretty high.",
        "scores": {
            "maltiness": 3,
            "colorDepth": 7,
            "clarity": 9.5,
            "bitterness": 1,
            "otherAromas": 8.5,
            "overall": 7
        }
    },
    {
        "id": "old-milwaukee-ice",
        "name": "OLD MILWAUKEE ICE",
        "style": "Lager",
        "abv": 5.5,
        "date": "2026-01-25",
        "price": 2.55,
        "imageUrl": "../assets/images/beers/old-milwaukee-ice.jpg?v=0a0b6c9",
        "notes": "There’s a faint bitterness on the first sip, followed by a very crisp, clean sensation, and then not much else in terms of flavor. The malt isn’t strong, but it is present. Overall, it feels decent enough.",
        "scores": {
            "maltiness": 5,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 2.5,
            "otherAromas": 1,
            "overall": 7.5
        }
    },
    {
        "id": "farm-league-brewing-hauler-lager",
        "name": "FARM LEAGUE BREWING HAULER LAGER",
        "style": "Lager",
        "abv": 4.8,
        "date": "2026-01-25",
        "price": 3.35,
        "imageUrl": "../assets/images/beers/farm-league-brewing-hauler-lager.jpg?v=0a0b6c9",
        "notes": "This might be the lightest beer I’ve ever had. There’s almost no distinctive flavor at all—just a clean, light, and refreshing sip. There’s no noticeable bitterness, hop character, or malt aroma, and oddly enough, that actually makes it quite enjoyable for me.",
        "scores": {
            "maltiness": 4,
            "colorDepth": 9,
            "clarity": 9.5,
            "bitterness": 1.5,
            "otherAromas": 1,
            "overall": 8
        }
    },
    {
        "id": "storyteller-lager",
        "name": "STORYTELLER LAGER",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-25",
        "price": 3.1,
        "imageUrl": "../assets/images/beers/storyteller-lager.jpg?v=0a0b6c9",
        "notes": "It has a very distinctive flavor. On the first sip, there’s a hint of hop character, followed by a light malty aftertaste. If you pay close attention, there also seems to be a faint floral note, though that could just be my imagination at the time.",
        "scores": {
            "maltiness": 5.5,
            "colorDepth": 9.5,
            "clarity": 9.5,
            "bitterness": 2.5,
            "otherAromas": 4.5,
            "overall": 7.5
        }
    },
    {
        "id": "indie-alehouse-marco-polo-italian-style-pilsner",
        "name": "Indie AleHouse Marco Polo Italian Style Pilsner",
        "style": "Pilsner",
        "abv": 5,
        "date": "2026-01-26",
        "price": 3.9,
        "imageUrl": "../assets/images/beers/indie-alehouse-marco-polo-italian-style-pilsner.jpg?v=0a0b6c9",
        "notes": "This is an Italian pilsner with a strong hop character on the first sip. What surprised me is that the finish also has a nice malty flavor. The initial aroma is likely what people often describe as “bready,” and together with the slightly hazy appearance of the beer, it really does give a subtle bread-like impression.",
        "scores": {
            "maltiness": 7,
            "colorDepth": 9,
            "clarity": 5,
            "bitterness": 4.5,
            "otherAromas": 4.5,
            "overall": 7
        }
    },
    {
        "id": "labatt-blue",
        "name": "LABATT BLUE",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-27",
        "price": 2.5,
        "imageUrl": "../assets/images/beers/labatt-blue.jpg?v=0a0b6c9",
        "notes": "After being tortured late into the night by Python dependencies for background removal, I opened this beer. The first sip is very refreshing, starting with a slightly sharp, prickly bite and finishing with a light malty note. The mouthfeel is smooth overall. Maybe it’s because the code wore me out, but it honestly tastes really good—I can’t really find anything to fault.",
        "scores": {
            "maltiness": 7,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 2,
            "otherAromas": 2.5,
            "overall": 8
        }
    },
    {
        "id": "laker-red",
        "name": "LAKER RED",
        "style": "Lager",
        "abv": 5.5,
        "date": "2026-01-27",
        "price": 2.4,
        "imageUrl": "../assets/images/beers/laker-red.jpg?v=0a0b6c9",
        "notes": "On the first sip, there’s an herbal note, followed by a malty flavor. The transition between the two feels both natural and slightly odd at the same time, which is quite interesting. I remember another lager that tasted similar, but I can’t recall exactly which one it was. I wouldn’t recommend drinking this with chicken wings—this subtle herbal note might pair better with some other kind of food.",
        "scores": {
            "maltiness": 7,
            "colorDepth": 2.5,
            "clarity": 9.5,
            "bitterness": 1.5,
            "otherAromas": 7.5,
            "overall": 6
        }
    },
    {
        "id": "beaus-lug-tread-lagered-ale",
        "name": "BEAUS LUG TREAD LAGERED ALE",
        "style": "Lagered Ale",
        "abv": 5.2,
        "date": "2026-01-31",
        "price": 3.69,
        "imageUrl": "../assets/images/beers/beaus-lug-tread-lagered-ale.jpg?v=0a0b6c9",
        "notes": "The first sip is fairly bitter, with a slight alcoholic note. It really does feel like many of the typical ale flavors have been stripped away, leaving mostly bitterness. Perhaps because of that, a bit of malt character comes through more clearly. To be honest, there is indeed a slight bready note to it.",
        "scores": {
            "maltiness": 7.5,
            "colorDepth": 8.5,
            "clarity": 9.5,
            "bitterness": 5,
            "otherAromas": 4.5,
            "overall": 7
        }
    },
    {
        "id": "stella-artois",
        "name": "STELLA ARTOIS",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-31",
        "price": 3.69,
        "imageUrl": "../assets/images/beers/stella-artois.jpg?v=0a0b6c9",
        "notes": "Stella Artois tastes like it has only a very faint hop note with a slight bitterness—extremely, extremely light. I’m not sure if it’s because I was eating spicy chicken wings at the same time, but it really feels very mild. Other than that, there isn’t much flavor to speak of. Still, this kind of profile is something I’m tasting for the first time.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 6.5,
            "clarity": 9.5,
            "bitterness": 1.5,
            "otherAromas": 1.5,
            "overall": 8
        }
    },
    {
        "id": "peroni-nastro-azzurro",
        "name": "PERONI NASTRO AZZURRO",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-31",
        "price": 3.79,
        "imageUrl": "../assets/images/beers/peroni-nastro-azzurro.jpg?v=0a0b6c9",
        "notes": "The first sip that left the strongest impression on me was actually the foam—it carried so many flavors at once: bitterness, malt aroma, a bready note, and that floury, fermented character. The bread-like flavor in particular stood out. I know Italian pasta well, but I hadn’t really thought about Italian bread before. This combination of bitterness, slight sweetness, and fermented aroma is gradually becoming a new preference for me. Even when I breathe out, there’s still a floury, dough-like scent lingering.",
        "scores": {
            "maltiness": 5.5,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 4.5,
            "otherAromas": 4.5,
            "overall": 7.5
        }
    },
    {
        "id": "corona",
        "name": "CORONA",
        "style": "Lager",
        "abv": 4.6,
        "date": "2026-01-31",
        "price": 3.39,
        "imageUrl": "../assets/images/beers/corona.jpg?v=0a0b6c9",
        "notes": "Corona really gives me the feeling of a Chinese domestic beer. It has a very pronounced malty aroma, paired with a bit of crispness on the first sip, and almost none of the flavors I usually dislike.",
        "scores": {
            "maltiness": 9,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 1,
            "otherAromas": 1,
            "overall": 9.5
        }
    },
    {
        "id": "canuck-pale-ale",
        "name": "CANUCK PALE ALE",
        "style": "Pale Ale",
        "abv": 5.2,
        "date": "2026-01-31",
        "price": 2.88,
        "imageUrl": "../assets/images/beers/canuck-pale-ale.jpg?v=0a0b6c9",
        "notes": "It has a very classic ale profile, with a strong hop character. There’s also a faint floral note, which makes it quite pleasant. Honestly, it tastes pretty good, especially since it isn’t very bitter.",
        "scores": {
            "maltiness": 2.5,
            "colorDepth": 6.5,
            "clarity": 2,
            "bitterness": 3.5,
            "otherAromas": 5.5,
            "overall": 8.5
        }
    },
    {
        "id": "flying-monkeys-velvet-bubble-lord-blueberry-sour",
        "name": "Flying Monkeys Velvet Bubble Lord Blueberry Sour",
        "style": "Other",
        "abv": 6,
        "date": "2026-02-01",
        "price": 3.49,
        "imageUrl": "../assets/images/beers/flying-monkeys-velvet-bubble-lord-blueberry-sour.jpg?v=0a0b6c9",
        "notes": "This beer is exactly what its name suggests—just one word: sour. Tooth-achingly sour. It definitely has a blueberry flavor, and the mouthfeel is like a sparkling champagne soda, but it’s really very sour.",
        "scores": {
            "maltiness": 6.5,
            "colorDepth": 1.5,
            "clarity": 4,
            "bitterness": 1,
            "otherAromas": 8.5,
            "overall": 6
        }
    },
    {
        "id": "sons-of-kent-brewing-8-track-xpa",
        "name": "Sons of Kent Brewing 8 Track XPA",
        "style": "Pale Ale",
        "abv": 5.7,
        "date": "2026-02-01",
        "price": 3.49,
        "imageUrl": "../assets/images/beers/sons-of-kent-brewing-8-track-xpa.jpg?v=0a0b6c9",
        "notes": "Maybe it’s because I haven’t had many IPAs, but honestly, I feel like most of them don’t differ much beyond the hop character. This one, if you taste it carefully, has a faint herbal note in the aftertaste—though that could just be my imagination. Overall, it actually drinks quite OK.",
        "scores": {
            "maltiness": 1.5,
            "colorDepth": 8.5,
            "clarity": 7.5,
            "bitterness": 3.5,
            "otherAromas": 4.5,
            "overall": 6.5
        }
    },
    {
        "id": "nickel-brook-wicked-awesome-ipa",
        "name": "NICKEL BROOK WICKED AWESOME IPA",
        "style": "IPA (India Pale Ale)",
        "abv": 6.5,
        "date": "2026-02-08",
        "price": 2.75,
        "imageUrl": "../assets/images/beers/nickel-brook-wicked-awesome-ipa.jpg?v=0a0b6c9",
        "notes": "I’ve noticed that my taste has shifted a bit recently. Maybe it’s because I’ve been drinking too much light beer, but I’m starting to find IPAs quite enjoyable as well. This one actually tastes pretty good to me—the first sip is bitter, with a strong hop character, but the finish has a nice malty note. In the middle, there also seems to be a faint fruity aroma. The ingredient list mentions barley, wheat, and oats, so maybe that mix of grains contributes to the flavor. Overall, it’s quite good.",
        "scores": {
            "maltiness": 5.5,
            "colorDepth": 9.5,
            "clarity": 2,
            "bitterness": 6,
            "otherAromas": 6,
            "overall": 8.5
        }
    },
    {
        "id": "laker-light",
        "name": "LAKER LIGHT",
        "style": "Lager",
        "abv": 4,
        "date": "2026-02-09",
        "price": 2.4,
        "imageUrl": "../assets/images/beers/laker-light.jpg?v=0a0b6c9",
        "notes": "This was my first time trying Laker Light. On the first sip, there’s a slightly oily mouthfeel at first, followed by a burst of crispness from the carbonation. There’s also a faint malty finish. Beers like this often let you pick up grainy notes from barley or wheat, and since I generally like light beers, this kind of beer is unlikely to disappoint me.",
        "scores": {
            "maltiness": 8,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 1,
            "otherAromas": 2,
            "overall": 8.5
        }
    }
];

    // Global filter state
    let activeFilter = {
        type: null,  // 'style', 'abv', 'price', or 'maltScore'
        value: null  // style name, range {min, max}, or {maltiness, overall} for scatter point
    };

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initializeNavigation();

        // Render statistics charts
        renderStatisticsCharts();

        // Sort by overall score on initial load (matches the default dropdown value)
        const initialSorted = sortBeers(beers, 'overall');
        renderBeerGallery(initialSorted);
        updateBeerCount(beers.length);

        initializeSorting();
        initializeImageModal();

        // Listen for language changes and re-render charts and count
        window.addEventListener('languageChange', function() {
            // Re-render with current sort selection
            const sortSelect = document.getElementById('sort-select');
            const currentSort = sortSelect ? sortSelect.value : 'overall';
            const filteredBeers = applyFilter(beers);
            const sortedBeers = sortBeers(filteredBeers, currentSort);
            renderBeerGallery(sortedBeers);
            updateBeerCount(filteredBeers.length);
        });
    });

    /**
     * Initialize mobile navigation toggle (same as main.js)
     */
    function initializeNavigation() {
        const navToggle = document.querySelector('.nav__toggle');
        const navMenu = document.querySelector('.nav__menu');

        if (!navToggle || !navMenu) return;

        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('id', 'nav-menu');

        navToggle.addEventListener('click', function () {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('nav__menu--open');
            navToggle.classList.toggle('nav__toggle--active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('nav__menu--open');
                navToggle.classList.remove('nav__toggle--active');
            });
        });
    }

    /**
     * Update beer count display
     */
    function updateBeerCount(count) {
        const countElement = document.getElementById('beer-count');
        if (!countElement) return;

        const getCountText = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return window.i18n.t('beer.totalBeers');
            }
            return 'Total Beers';
        };

        const countText = getCountText();
        countElement.textContent = `${countText}: ${count}`;
    }

    /**
     * Apply active filter to beer list
     */
    function applyFilter(beerList) {
        if (!activeFilter.type) {
            return beerList;
        }

        if (activeFilter.type === 'style') {
            return beerList.filter(beer => beer.style === activeFilter.value);
        }

        if (activeFilter.type === 'abv') {
            return beerList.filter(beer =>
                beer.abv >= activeFilter.value.min && beer.abv <= activeFilter.value.max
            );
        }

        if (activeFilter.type === 'price') {
            return beerList.filter(beer =>
                beer.price >= activeFilter.value.min && beer.price <= activeFilter.value.max
            );
        }

        if (activeFilter.type === 'maltScore') {
            return beerList.filter(beer =>
                beer.scores.maltiness === activeFilter.value.maltiness &&
                beer.scores.overall === activeFilter.value.overall
            );
        }

        if (activeFilter.type === 'prediction') {
            // Filter by predicted beer IDs (array of IDs)
            const idSet = new Set(activeFilter.value);
            const filtered = beerList.filter(beer => idSet.has(beer.id));

            // Sort by prediction order (first predicted beer appears first)
            return filtered.sort((a, b) => {
                const indexA = activeFilter.value.indexOf(a.id);
                const indexB = activeFilter.value.indexOf(b.id);
                return indexA - indexB;
            });
        }

        return beerList;
    }

    /**
     * Update display with current filter and sort
     */
    function updateDisplay() {
        const sortSelect = document.getElementById('sort-select');
        const currentSort = sortSelect ? sortSelect.value : 'overall';
        const filteredBeers = applyFilter(beers);
        const sortedBeers = sortBeers(filteredBeers, currentSort);
        renderBeerGallery(sortedBeers);
        updateBeerCount(filteredBeers.length);
    }

    /**
     * Set filter and update display
     */
    function setFilter(type, value) {
        // Toggle off if clicking the same filter
        if (activeFilter.type === type &&
            ((type === 'style' && activeFilter.value === value) ||
             ((type === 'abv' || type === 'price') && activeFilter.value.min === value.min && activeFilter.value.max === value.max) ||
             (type === 'maltScore' && activeFilter.value.maltiness === value.maltiness && activeFilter.value.overall === value.overall))) {
            activeFilter = { type: null, value: null };
        } else {
            // Auto-clear prediction filter when clicking any other filter
            // This makes prediction filter temporary and clears it with user interaction
            if (activeFilter.type === 'prediction' && type !== 'prediction') {
                console.log('Auto-clearing AI prediction filter');
            }
            activeFilter = { type, value };
        }

        // Re-render charts to update visual state
        renderStatisticsCharts();

        // Update beer display
        updateDisplay();
    }

    /**
     * Render all statistics charts
     */
    function renderStatisticsCharts() {
        renderStylePieChart();
        renderAbvHistogram();
        renderPriceHistogram();
        renderMaltScoreScatter();
    }

    /**
     * Render beer style distribution pie chart
     */
    function renderStylePieChart() {
        const svg = document.getElementById('style-pie-chart');
        if (!svg) return;

        // Count beers by style
        const styleCounts = {};
        beers.forEach(beer => {
            styleCounts[beer.style] = (styleCounts[beer.style] || 0) + 1;
        });

        // Convert to array and sort by count
        const styleData = Object.entries(styleCounts)
            .map(([style, count]) => ({ style, count }))
            .sort((a, b) => b.count - a.count);

        // Modern color palette with deeper, richer colors (15 distinct colors)
        const colors = [
            '#3A7BC8', '#6A5ACD', '#3CB371', '#FFA500',
            '#E6537D', '#20B2AA', '#FF6347', '#8B4789',
            '#1E8B8B', '#BA55D3', '#CD853F', '#4169E1',
            '#32CD32', '#FF1493', '#8B7355'
        ];

        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 20;
        const centerX = width / 2;
        const centerY = height / 2;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.innerHTML = '';

        // Add drop shadow filter
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'drop-shadow');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');

        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', '3');
        filter.appendChild(feGaussianBlur);

        const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
        feOffset.setAttribute('dx', '0');
        feOffset.setAttribute('dy', '2');
        feOffset.setAttribute('result', 'offsetblur');
        filter.appendChild(feOffset);

        const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
        feFuncA.setAttribute('type', 'linear');
        feFuncA.setAttribute('slope', '0.3');
        feComponentTransfer.appendChild(feFuncA);
        filter.appendChild(feComponentTransfer);

        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feMerge);

        defs.appendChild(filter);
        svg.appendChild(defs);

        // Calculate total for percentages
        const total = styleData.reduce((sum, d) => sum + d.count, 0);

        // Draw pie slices
        let currentAngle = -Math.PI / 2; // Start from top
        styleData.forEach((d, i) => {
            const sliceAngle = (d.count / total) * 2 * Math.PI;
            const endAngle = currentAngle + sliceAngle;

            // Create path for pie slice
            const x1 = centerX + radius * Math.cos(currentAngle);
            const y1 = centerY + radius * Math.sin(currentAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '2');
            path.style.cursor = 'pointer';

            // Check if this slice is currently filtered
            const isActive = activeFilter.type === 'style' && activeFilter.value === d.style;
            const isOtherActive = activeFilter.type === 'style' && activeFilter.value !== d.style;

            // Set initial opacity based on filter state
            if (isActive) {
                path.setAttribute('opacity', '1');
            } else if (isOtherActive) {
                path.setAttribute('opacity', '0.3');
            } else {
                path.setAttribute('opacity', '1');
            }

            // Create label group for hover
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');
            labelGroup.style.display = 'none';

            const labelText = `${d.style}: ${d.count} beer${d.count > 1 ? 's' : ''}`;
            const textWidth = labelText.length * 6;
            const padding = 6;

            // Background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', centerX - textWidth / 2 - padding);
            bgRect.setAttribute('y', centerY - 25);
            bgRect.setAttribute('width', textWidth + padding * 2);
            bgRect.setAttribute('height', 18);
            bgRect.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
            bgRect.setAttribute('stroke', '#333');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('rx', '3');
            labelGroup.appendChild(bgRect);

            // Text
            const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElem.setAttribute('x', centerX);
            textElem.setAttribute('y', centerY - 13);
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('font-size', '11');
            textElem.setAttribute('fill', '#333');
            textElem.setAttribute('font-weight', 'bold');
            textElem.textContent = labelText;
            labelGroup.appendChild(textElem);

            svg.appendChild(labelGroup);

            // Add hover effect with shadow
            path.addEventListener('mouseenter', function() {
                if (!isOtherActive) {
                    this.setAttribute('opacity', '0.9');
                    this.style.filter = 'url(#drop-shadow)';
                    labelGroup.style.display = 'block';
                    svg.appendChild(labelGroup);
                }
            });
            path.addEventListener('mouseleave', function() {
                if (isActive) {
                    this.setAttribute('opacity', '1');
                } else if (isOtherActive) {
                    this.setAttribute('opacity', '0.3');
                } else {
                    this.setAttribute('opacity', '1');
                }
                this.style.filter = '';
                labelGroup.style.display = 'none';
            });

            // Add click event to filter by style
            path.addEventListener('click', function() {
                setFilter('style', d.style);
            });

            // Add label
            const midAngle = currentAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + labelRadius * Math.cos(midAngle);
            const labelY = centerY + labelRadius * Math.sin(midAngle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#fff');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.textContent = d.count;

            svg.appendChild(path);
            svg.appendChild(text);

            currentAngle = endAngle;
        });

        // Add legend
        const legendX = 10;
        let legendY = 10;
        styleData.forEach((d, i) => {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', legendX);
            rect.setAttribute('y', legendY);
            rect.setAttribute('width', '12');
            rect.setAttribute('height', '12');
            rect.setAttribute('fill', colors[i % colors.length]);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', legendX + 16);
            text.setAttribute('y', legendY + 10);
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#333');
            text.textContent = `${d.style} (${d.count})`;

            svg.appendChild(rect);
            svg.appendChild(text);

            legendY += 16;
        });
    }

    /**
     * Render ABV distribution histogram
     */
    function renderAbvHistogram() {
        const svg = document.getElementById('abv-histogram');
        if (!svg) return;

        const width = 300;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.innerHTML = '';

        // Create bins for ABV ranges
        const binSize = 0.5;
        const minAbv = Math.floor(Math.min(...beers.map(b => b.abv)) / binSize) * binSize;
        const maxAbv = Math.ceil(Math.max(...beers.map(b => b.abv)) / binSize) * binSize;

        const bins = [];
        for (let i = minAbv; i < maxAbv; i += binSize) {
            bins.push({
                min: i,
                max: i + binSize,
                count: 0,
                label: `${i.toFixed(1)}-${(i + binSize).toFixed(1)}`
            });
        }

        beers.forEach(beer => {
            // For the last bin, use <= to include the max value (e.g., ABV = 10.0)
            const bin = bins.find((b, idx) =>
                beer.abv >= b.min && (idx === bins.length - 1 ? beer.abv <= b.max : beer.abv < b.max)
            );
            if (bin) bin.count++;
        });

        const maxCount = Math.max(...bins.map(b => b.count));

        // Draw bars
        const barWidth = chartWidth / bins.length - 2;
        bins.forEach((bin, i) => {
            const barHeight = (bin.count / maxCount) * chartHeight;
            const x = margin.left + i * (chartWidth / bins.length);
            const y = margin.top + chartHeight - barHeight;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.style.cursor = 'pointer';

            // Check if this bar is currently filtered
            const isActive = activeFilter.type === 'abv' &&
                activeFilter.value.min === bin.min &&
                activeFilter.value.max === bin.max;
            const isOtherActive = activeFilter.type === 'abv' &&
                (activeFilter.value.min !== bin.min || activeFilter.value.max !== bin.max);

            // Set fill and opacity based on filter state with rounded corners
            if (isActive) {
                rect.setAttribute('fill', '#4682B4');
                rect.setAttribute('opacity', '1');
            } else if (isOtherActive) {
                rect.setAttribute('fill', '#4682B4');
                rect.setAttribute('opacity', '0.3');
            } else {
                rect.setAttribute('fill', '#4682B4');
                rect.setAttribute('opacity', '1');
            }
            rect.setAttribute('stroke', '#fff');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('rx', '3');
            rect.setAttribute('ry', '3');

            // Create label group for hover
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');
            labelGroup.style.display = 'none';

            const labelText = `ABV: ${bin.min.toFixed(1)}%-${bin.max.toFixed(1)}% (${bin.count} beer${bin.count > 1 ? 's' : ''})`;
            const textWidth = labelText.length * 5.5;
            const padding = 6;

            // Background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', x + barWidth / 2 - textWidth / 2 - padding);
            bgRect.setAttribute('y', y - 25);
            bgRect.setAttribute('width', textWidth + padding * 2);
            bgRect.setAttribute('height', 18);
            bgRect.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
            bgRect.setAttribute('stroke', '#333');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('rx', '3');
            labelGroup.appendChild(bgRect);

            // Text
            const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElem.setAttribute('x', x + barWidth / 2);
            textElem.setAttribute('y', y - 13);
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('font-size', '10');
            textElem.setAttribute('fill', '#333');
            textElem.setAttribute('font-weight', 'bold');
            textElem.textContent = labelText;
            labelGroup.appendChild(textElem);

            svg.appendChild(labelGroup);

            rect.addEventListener('mouseenter', function() {
                if (!isOtherActive) {
                    this.setAttribute('fill', '#36648B');
                    this.style.filter = 'url(#drop-shadow)';
                    labelGroup.style.display = 'block';
                    svg.appendChild(labelGroup);
                }
            });
            rect.addEventListener('mouseleave', function() {
                this.setAttribute('fill', '#4682B4');
                this.style.filter = '';
                labelGroup.style.display = 'none';
            });

            // Add click event to filter by ABV range
            rect.addEventListener('click', function() {
                setFilter('abv', { min: bin.min, max: bin.max });
            });

            // Add count label on top of bar
            if (bin.count > 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + barWidth / 2);
                text.setAttribute('y', y - 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#333');
                text.textContent = bin.count;
                svg.appendChild(text);
            }

            svg.appendChild(rect);
        });

        // Draw axes
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', height - margin.bottom);
        xAxis.setAttribute('x2', width - margin.right);
        xAxis.setAttribute('y2', height - margin.bottom);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '2');
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', height - margin.bottom);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '2');
        svg.appendChild(yAxis);

        // Add x-axis label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', width / 2);
        xLabel.setAttribute('y', height - 5);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '12');
        xLabel.setAttribute('fill', '#333');
        xLabel.textContent = 'ABV (%)';
        svg.appendChild(xLabel);

        // Add y-axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', 10);
        yLabel.setAttribute('y', 15);
        yLabel.setAttribute('font-size', '12');
        yLabel.setAttribute('fill', '#333');
        yLabel.textContent = 'Count';
        svg.appendChild(yLabel);
    }

    /**
     * Render price distribution histogram
     */
    function renderPriceHistogram() {
        const svg = document.getElementById('price-histogram');
        if (!svg) return;

        const width = 300;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.innerHTML = '';

        // Filter beers with price data
        const beersWithPrice = beers.filter(b => b.price && b.price > 0);
        if (beersWithPrice.length === 0) return;

        // Find price range
        const prices = beersWithPrice.map(b => b.price);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));

        // Create bins (e.g., $1 increments)
        const binSize = 1.0;
        const bins = [];
        for (let i = minPrice; i < maxPrice; i += binSize) {
            bins.push({ min: i, max: i + binSize, count: 0 });
        }

        // Count beers in each bin
        beersWithPrice.forEach(beer => {
            // For the last bin, use <= to include the max value
            const bin = bins.find((b, idx) =>
                beer.price >= b.min && (idx === bins.length - 1 ? beer.price <= b.max : beer.price < b.max)
            );
            if (bin) bin.count++;
        });

        const maxCount = Math.max(...bins.map(b => b.count));

        // Draw bars
        const barWidth = chartWidth / bins.length - 2;
        bins.forEach((bin, i) => {
            const barHeight = (bin.count / maxCount) * chartHeight;
            const x = margin.left + i * (chartWidth / bins.length);
            const y = margin.top + chartHeight - barHeight;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.style.cursor = 'pointer';

            // Check if this bar is currently filtered
            const isActive = activeFilter.type === 'price' &&
                activeFilter.value.min === bin.min &&
                activeFilter.value.max === bin.max;
            const isOtherActive = activeFilter.type === 'price' &&
                (activeFilter.value.min !== bin.min || activeFilter.value.max !== bin.max);

            // Set fill and opacity based on filter state with rounded corners
            if (isActive) {
                rect.setAttribute('fill', '#48A999');
                rect.setAttribute('opacity', '1');
            } else if (isOtherActive) {
                rect.setAttribute('fill', '#48A999');
                rect.setAttribute('opacity', '0.3');
            } else {
                rect.setAttribute('fill', '#48A999');
                rect.setAttribute('opacity', '1');
            }
            rect.setAttribute('stroke', '#fff');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('rx', '3');
            rect.setAttribute('ry', '3');

            // Create label group for hover
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');
            labelGroup.style.display = 'none';

            const labelText = `Price: $${bin.min.toFixed(2)}-$${bin.max.toFixed(2)} (${bin.count} beer${bin.count > 1 ? 's' : ''})`;
            const textWidth = labelText.length * 5.5;
            const padding = 6;

            // Background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', x + barWidth / 2 - textWidth / 2 - padding);
            bgRect.setAttribute('y', y - 25);
            bgRect.setAttribute('width', textWidth + padding * 2);
            bgRect.setAttribute('height', 18);
            bgRect.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
            bgRect.setAttribute('stroke', '#333');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('rx', '3');
            labelGroup.appendChild(bgRect);

            // Text
            const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElem.setAttribute('x', x + barWidth / 2);
            textElem.setAttribute('y', y - 13);
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('font-size', '10');
            textElem.setAttribute('fill', '#333');
            textElem.setAttribute('font-weight', 'bold');
            textElem.textContent = labelText;
            labelGroup.appendChild(textElem);

            svg.appendChild(labelGroup);

            rect.addEventListener('mouseenter', function() {
                if (!isOtherActive) {
                    this.setAttribute('fill', '#3A8B7A');
                    this.style.filter = 'url(#drop-shadow)';
                    labelGroup.style.display = 'block';
                    svg.appendChild(labelGroup);
                }
            });
            rect.addEventListener('mouseleave', function() {
                this.setAttribute('fill', '#48A999');
                this.style.filter = '';
                labelGroup.style.display = 'none';
            });

            // Add click event to filter by price range
            rect.addEventListener('click', function() {
                setFilter('price', { min: bin.min, max: bin.max });
            });

            // Add count label on top of bar
            if (bin.count > 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + barWidth / 2);
                text.setAttribute('y', y - 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#333');
                text.textContent = bin.count;
                svg.appendChild(text);
            }

            svg.appendChild(rect);
        });

        // Draw axes
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', height - margin.bottom);
        xAxis.setAttribute('x2', width - margin.right);
        xAxis.setAttribute('y2', height - margin.bottom);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '2');
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', height - margin.bottom);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '2');
        svg.appendChild(yAxis);

        // Add x-axis label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', width / 2);
        xLabel.setAttribute('y', height - 5);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '12');
        xLabel.setAttribute('fill', '#333');
        xLabel.textContent = 'Price ($)';
        svg.appendChild(xLabel);

        // Add y-axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', 10);
        yLabel.setAttribute('y', 15);
        yLabel.setAttribute('font-size', '12');
        yLabel.setAttribute('fill', '#333');
        yLabel.textContent = 'Count';
        svg.appendChild(yLabel);
    }

    /**
     * Render Maltiness vs Overall Score scatter plot
     */
    function renderMaltScoreScatter() {
        const svg = document.getElementById('malt-score-scatter');
        if (!svg) return;

        const width = 300;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.innerHTML = '';

        const minMalt = 0;
        const maxMalt = 10;
        const minScore = 0;
        const maxScore = 10;

        // Draw axes
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', height - margin.bottom);
        xAxis.setAttribute('x2', width - margin.right);
        xAxis.setAttribute('y2', height - margin.bottom);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '2');
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', height - margin.bottom);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '2');
        svg.appendChild(yAxis);

        // Draw grid lines
        for (let i = 2; i <= 10; i += 2) {
            // Horizontal grid lines (for overall score)
            const y = margin.top + chartHeight - ((i - minScore) / (maxScore - minScore)) * chartHeight;
            const hGridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            hGridLine.setAttribute('x1', margin.left);
            hGridLine.setAttribute('y1', y);
            hGridLine.setAttribute('x2', width - margin.right);
            hGridLine.setAttribute('y2', y);
            hGridLine.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
            hGridLine.setAttribute('stroke-width', '1');
            svg.appendChild(hGridLine);

            const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            yLabel.setAttribute('x', margin.left - 5);
            yLabel.setAttribute('y', y + 3);
            yLabel.setAttribute('text-anchor', 'end');
            yLabel.setAttribute('font-size', '10');
            yLabel.setAttribute('fill', '#666');
            yLabel.textContent = i;
            svg.appendChild(yLabel);

            // Vertical grid lines (for maltiness)
            const x = margin.left + ((i - minMalt) / (maxMalt - minMalt)) * chartWidth;
            const vGridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            vGridLine.setAttribute('x1', x);
            vGridLine.setAttribute('y1', margin.top);
            vGridLine.setAttribute('x2', x);
            vGridLine.setAttribute('y2', height - margin.bottom);
            vGridLine.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
            vGridLine.setAttribute('stroke-width', '1');
            svg.appendChild(vGridLine);

            const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            xLabel.setAttribute('x', x);
            xLabel.setAttribute('y', height - margin.bottom + 15);
            xLabel.setAttribute('text-anchor', 'middle');
            xLabel.setAttribute('font-size', '10');
            xLabel.setAttribute('fill', '#666');
            xLabel.textContent = i;
            svg.appendChild(xLabel);
        }

        // Group beers by same maltiness and overall score
        const pointGroups = {};
        beers.forEach(beer => {
            const key = `${beer.scores.maltiness},${beer.scores.overall}`;
            if (!pointGroups[key]) {
                pointGroups[key] = [];
            }
            pointGroups[key].push(beer);
        });

        // Store circles and labels for two-pass rendering
        const circlesData = [];

        // First pass: Create text labels and prepare circle data
        Object.entries(pointGroups).forEach(([key, beersAtPoint]) => {
            const maltiness = beersAtPoint[0].scores.maltiness;
            const overall = beersAtPoint[0].scores.overall;
            const x = margin.left + ((maltiness - minMalt) / (maxMalt - minMalt)) * chartWidth;
            const y = margin.top + chartHeight - ((overall - minScore) / (maxScore - minScore)) * chartHeight;

            // Check if this point is currently filtered
            const isActive = activeFilter.type === 'maltScore' &&
                activeFilter.value.maltiness === maltiness &&
                activeFilter.value.overall === overall;
            const isOtherActive = activeFilter.type === 'maltScore' &&
                (activeFilter.value.maltiness !== maltiness || activeFilter.value.overall !== overall);

            // Prepare beer names for display (max 3, each on new line with number prefix)
            const beerNamesArray = beersAtPoint.slice(0, 3).map((b, idx) => `${idx + 1}. ${b.name}`);
            if (beersAtPoint.length > 3) {
                beerNamesArray.push('...');
            }

            // Create label group for hover with background
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');
            labelGroup.style.display = 'none';

            // Background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
            bgRect.setAttribute('stroke', '#333');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('rx', '3');

            // Create text lines (one per beer)
            const lineHeight = 12;
            const startY = y - 10 - (beerNamesArray.length * lineHeight);
            const padding = 4;

            // Determine label position based on x position
            // If point is on the left half of chart, show label on right
            // If point is on the right half, show label on left
            const chartCenterX = width / 2;
            const labelOffset = 5; // Distance from point to label
            const isPointOnLeft = x < chartCenterX;

            // First, add labelGroup to SVG so getBBox() can work
            svg.appendChild(labelGroup);

            // Create text elements and measure actual width
            const textElements = [];
            let actualMaxWidth = 0;

            beerNamesArray.forEach((name, idx) => {
                const textLine = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textLine.setAttribute('x', 0); // Temporary position
                textLine.setAttribute('y', startY + (idx * lineHeight) + 10);
                textLine.setAttribute('font-size', '10');
                textLine.setAttribute('fill', '#333');
                textLine.setAttribute('font-weight', 'bold');
                textLine.textContent = name;
                labelGroup.appendChild(textLine);
                textElements.push(textLine);

                // Get actual text width after element is in DOM
                const bbox = textLine.getBBox();
                actualMaxWidth = Math.max(actualMaxWidth, bbox.width);
            });

            // Now position elements based on actual measured width
            const labelOffsetX = isPointOnLeft ? labelOffset : -(actualMaxWidth + padding * 2 + labelOffset);

            // Update text positions
            textElements.forEach((textLine) => {
                textLine.setAttribute('x', x + labelOffsetX + padding);
            });

            // Set background rectangle dimensions with actual width
            bgRect.setAttribute('x', x + labelOffsetX);
            bgRect.setAttribute('y', startY);
            bgRect.setAttribute('width', actualMaxWidth + padding * 2);
            bgRect.setAttribute('height', beerNamesArray.length * lineHeight + padding);
            labelGroup.insertBefore(bgRect, labelGroup.firstChild);

            // Store circle data for second pass
            circlesData.push({
                x, y, maltiness, overall, isActive, isOtherActive,
                beersAtPoint, labelGroup, beerNamesArray
            });
        });

        // Calculate maximum radius based on 0.5 score units (minimum distance between points)
        const unitDistance = (0.5 / (maxMalt - minMalt)) * chartWidth;
        const maxRadiusLimit = unitDistance / 2; // Diameter should not exceed 0.5 units
        const minRadiusLimit = 4; // Minimum radius for visibility

        // Find min and max beer counts across all points
        const beerCounts = circlesData.map(d => d.beersAtPoint.length);
        const minBeerCount = Math.min(...beerCounts);
        const maxBeerCount = Math.max(...beerCounts);

        // Function to calculate radius based on beer count
        // Area is directly proportional to beer count
        const getRadius = (beerCount) => {
            if (maxBeerCount === minBeerCount) {
                // If all points have same count, use middle size
                return (minRadiusLimit + maxRadiusLimit) / 2;
            }

            // We want: area_at_count / area_at_min = count / minCount
            // So: area_at_count = (count / minCount) * area_at_min
            // But we also need: area_at_max corresponds to maxCount
            // So: area_at_min = (minCount / maxCount) * area_at_max

            // Work backwards from the constraints:
            // At minCount: use minRadiusLimit, so area = π * minRadiusLimit²
            // At maxCount: use maxRadiusLimit, so area = π * maxRadiusLimit²
            // For count beers: area should be proportional to count

            // Scale factor to make minCount → minRadius and maxCount → maxRadius
            // area(count) = k * count, where k is chosen such that:
            // k * minCount = π * minRadiusLimit²
            // k * maxCount = π * maxRadiusLimit²
            // But these two constraints conflict unless we scale differently

            // Better approach: scale area linearly with count within our min/max bounds
            const minArea = Math.PI * minRadiusLimit * minRadiusLimit;
            const maxArea = Math.PI * maxRadiusLimit * maxRadiusLimit;

            // Area should grow proportionally: area(n) / area(min) = n / min
            // So area(n) = area(min) * (n / min)
            // But we need to fit this into [minArea, maxArea] range
            // Let's use: area(n) = baseArea * (n / minCount)
            // where baseArea is chosen so that area(maxCount) = maxArea
            // baseArea * (maxCount / minCount) = maxArea
            // baseArea = maxArea * (minCount / maxCount)

            const baseArea = maxArea * (minBeerCount / maxBeerCount);
            const targetArea = baseArea * (beerCount / minBeerCount);

            // Convert area back to radius: r = sqrt(area / π)
            return Math.sqrt(targetArea / Math.PI);
        };

        // Second pass: Create and append circles (so they appear on top)
        circlesData.forEach(data => {
            const { x, y, maltiness, overall, isActive, isOtherActive, beersAtPoint, labelGroup, beerNamesArray } = data;

            // Calculate radius based on number of beers at this point
            const beerCount = beersAtPoint.length;
            const radius = getRadius(beerCount);

            // Create circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', radius.toString());
            circle.style.cursor = 'pointer';

            // Set fill and opacity based on filter state
            if (isActive) {
                circle.setAttribute('fill', '#FFB84D');
                circle.setAttribute('opacity', '1');
            } else if (isOtherActive) {
                circle.setAttribute('fill', '#9370DB');
                circle.setAttribute('opacity', '0.3');
            } else {
                circle.setAttribute('fill', '#9370DB');
                circle.setAttribute('opacity', '1');
            }
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');

            // Create tooltip (native browser tooltip)
            const tooltipText = beerNamesArray.join('\n');
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${tooltipText}\nMalt: ${maltiness}, Overall: ${overall}`;
            circle.appendChild(title);

            // Hover effects
            circle.addEventListener('mouseenter', function() {
                if (!isOtherActive) {
                    this.setAttribute('r', (radius + 2).toString());
                    this.setAttribute('fill', '#FFB84D');
                    this.style.filter = 'url(#drop-shadow)';
                    labelGroup.style.display = 'block';
                    // Move labelGroup to end of SVG so it appears on top of all circles
                    svg.appendChild(labelGroup);
                }
            });
            circle.addEventListener('mouseleave', function() {
                this.setAttribute('r', radius.toString());
                if (isActive) {
                    this.setAttribute('fill', '#FFB84D');
                } else {
                    this.setAttribute('fill', '#9370DB');
                }
                this.style.filter = '';
                labelGroup.style.display = 'none';
            });

            // Click to filter
            circle.addEventListener('click', function() {
                setFilter('maltScore', { maltiness, overall });
            });

            svg.appendChild(circle);
        });

        // Add x-axis label
        const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xAxisLabel.setAttribute('x', width / 2);
        xAxisLabel.setAttribute('y', height - 5);
        xAxisLabel.setAttribute('text-anchor', 'middle');
        xAxisLabel.setAttribute('font-size', '12');
        xAxisLabel.setAttribute('fill', '#333');
        xAxisLabel.textContent = 'Maltiness';
        svg.appendChild(xAxisLabel);

        // Add y-axis label
        const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yAxisLabel.setAttribute('x', 10);
        yAxisLabel.setAttribute('y', 15);
        yAxisLabel.setAttribute('font-size', '12');
        yAxisLabel.setAttribute('fill', '#333');
        yAxisLabel.textContent = 'Overall';
        svg.appendChild(yAxisLabel);
    }

    /**
     * Render beer gallery
     */
    function renderBeerGallery(beerList) {
        const grid = document.getElementById('beer-grid');
        if (!grid) return;

        grid.innerHTML = '';

        beerList.forEach(function (beer) {
            const card = createBeerCard(beer);
            grid.appendChild(card);
        });
    }

    /**
     * Create a beer card element
     */
    function createBeerCard(beer) {
        const card = document.createElement('article');
        card.className = 'beer-card';
        card.setAttribute('data-beer-id', beer.id);

        // Content wrapper
        const content = document.createElement('div');
        content.className = 'beer-card__content';

        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'beer-card__image-container';

        const image = document.createElement('img');
        image.className = 'beer-card__image';
        image.src = beer.imageUrl;
        image.alt = `${beer.name} - ${beer.style}`;
        image.onerror = function () {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'beer-card__image-placeholder';
            placeholder.innerHTML = '🍺';
            imageContainer.appendChild(placeholder);
        };
        imageContainer.appendChild(image);

        // Info container
        const info = document.createElement('div');
        info.className = 'beer-card__info';

        const name = document.createElement('h3');
        name.className = 'beer-card__name';
        name.textContent = beer.name;

        const meta = document.createElement('div');
        meta.className = 'beer-card__meta';
        meta.innerHTML = `<span>${beer.style}</span> <span>•</span> <span>${beer.abv}% ABV</span>`;

        // Price display (separate line)
        const priceDiv = document.createElement('div');
        priceDiv.className = 'beer-card__meta';
        const getPriceLabel = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return window.i18n.t('beer.priceLabel');
            }
            return 'Price';
        };
        const getPriceNotProvided = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return window.i18n.t('beer.priceNotProvided');
            }
            return 'Not provided';
        };
        const priceLabel = getPriceLabel();
        const priceValue = beer.price > 0 ? `$${beer.price.toFixed(2)}` : getPriceNotProvided();
        priceDiv.innerHTML = `<span>${priceLabel}</span> <span>•</span> <span>${priceValue}</span>`;

        const notes = document.createElement('p');
        notes.className = 'beer-card__notes';
        notes.textContent = beer.notes;
        notes.setAttribute('title', 'Click to expand/collapse');

        // Add click handler for expand/collapse
        notes.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('beer-card__notes--expanded');
        });

        info.appendChild(name);
        info.appendChild(meta);
        info.appendChild(priceDiv);
        info.appendChild(notes);

        // Radar chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'beer-card__chart-container';

        // Create SVG radar chart
        const svg = createSVGRadarChart(beer.scores, `chart-${beer.id}`);
        chartContainer.appendChild(svg);

        // Assemble card
        content.appendChild(imageContainer);
        content.appendChild(info);
        content.appendChild(chartContainer);
        card.appendChild(content);

        return card;
    }

    /**
     * Create SVG radar chart for beer scores
     * Pure SVG implementation - infinitely scalable!
     * Uses i18n system for bilingual label support
     */
    function createSVGRadarChart(scores, id) {
        // Use translation keys that will be replaced by i18n system
        const getLabels = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return [
                    window.i18n.t('beer.labelMalt'),
                    window.i18n.t('beer.labelDepth'),
                    window.i18n.t('beer.labelClarity'),
                    window.i18n.t('beer.labelBitter'),
                    window.i18n.t('beer.labelAromas'),
                    window.i18n.t('beer.labelOverall')
                ];
            }
            return ['Malt', 'Depth', 'Clarity', 'Bitter', 'Aromas', 'Overall'];
        };

        const labels = getLabels();
        const data = [
            scores.maltiness,
            scores.colorDepth,
            scores.clarity,
            scores.bitterness,
            scores.otherAromas,
            scores.overall
        ];

        const size = 200;
        const center = size / 2;
        const maxRadius = size / 2 - 30;
        const levels = 5; // 0, 2, 4, 6, 8, 10
        const axes = data.length;

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.setAttribute('class', 'beer-card__chart');
        svg.setAttribute('id', id);

        // Draw background grid (concentric polygons)
        for (let level = 1; level <= levels; level++) {
            const radius = (maxRadius / levels) * level;
            const points = [];

            for (let i = 0; i < axes; i++) {
                const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                points.push(`${x},${y}`);
            }

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', points.join(' '));
            polygon.setAttribute('fill', 'none');
            polygon.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
            polygon.setAttribute('stroke-width', '1');
            svg.appendChild(polygon);
        }

        // Draw axis lines
        for (let i = 0; i < axes; i++) {
            const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
            const x = center + maxRadius * Math.cos(angle);
            const y = center + maxRadius * Math.sin(angle);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', center);
            line.setAttribute('y1', center);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        }

        // Draw data polygon
        const dataPoints = [];
        for (let i = 0; i < axes; i++) {
            const value = data[i];
            const radius = (maxRadius / 10) * value; // Scale to max value of 10
            const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            dataPoints.push(`${x},${y}`);
        }

        const dataPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        dataPolygon.setAttribute('points', dataPoints.join(' '));
        dataPolygon.setAttribute('fill', 'rgba(0, 123, 255, 0.3)');
        dataPolygon.setAttribute('stroke', 'rgba(0, 123, 255, 1)');
        dataPolygon.setAttribute('stroke-width', '2');
        svg.appendChild(dataPolygon);

        // Draw scale numbers (0, 2, 4, 6, 8, 10)
        for (let level = 1; level <= levels; level++) {
            const radius = (maxRadius / levels) * level;
            const scaleValue = (10 / levels) * level;

            // Position scale number on the first axis (top)
            const angle = -Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            const scaleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            scaleText.setAttribute('x', x);
            scaleText.setAttribute('y', y - 5); // Offset slightly above the line
            scaleText.setAttribute('text-anchor', 'middle');
            scaleText.setAttribute('font-size', '9');
            scaleText.setAttribute('fill', '#666');
            scaleText.textContent = scaleValue;
            svg.appendChild(scaleText);
        }

        // Create tooltip elements (will be added to SVG at the end to be on top)
        const tooltipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tooltipGroup.setAttribute('class', 'chart-tooltip');
        tooltipGroup.style.display = 'none';
        tooltipGroup.style.pointerEvents = 'none';

        const tooltipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tooltipRect.setAttribute('fill', 'rgba(0, 0, 0, 0.8)');
        tooltipRect.setAttribute('rx', '4');
        tooltipRect.setAttribute('ry', '4');

        const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tooltipText.setAttribute('fill', '#fff');
        tooltipText.setAttribute('font-size', '11');
        tooltipText.setAttribute('font-weight', 'bold');

        tooltipGroup.appendChild(tooltipRect);
        tooltipGroup.appendChild(tooltipText);

        // Draw data points (circles) with hover effects
        const getFullLabels = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return [
                    window.i18n.t('beer.labelMaltinessFull'),
                    window.i18n.t('beer.labelColorDepthFull'),
                    window.i18n.t('beer.labelClarityFull'),
                    window.i18n.t('beer.labelBitternessFull'),
                    window.i18n.t('beer.labelOtherAromasFull'),
                    window.i18n.t('beer.labelOverallFull')
                ];
            }
            return ['Maltiness', 'Color Depth', 'Clarity', 'Bitterness', 'Other Aromas', 'Overall'];
        };

        const fullLabels = getFullLabels();

        for (let i = 0; i < axes; i++) {
            const value = data[i];
            const radius = (maxRadius / 10) * value;
            const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', 'rgba(0, 123, 255, 1)');
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');
            circle.style.cursor = 'pointer';

            // Add hover effects with tooltip
            circle.addEventListener('mouseenter', function() {
                this.setAttribute('r', '6');
                this.setAttribute('fill', 'rgba(255, 193, 7, 1)');

                // Set tooltip content and position
                const label = fullLabels[i];
                const text = `${label}: ${value}/10`;
                tooltipText.textContent = text;
                tooltipText.setAttribute('x', x);
                tooltipText.setAttribute('y', y - 15);
                tooltipText.setAttribute('text-anchor', 'middle');

                // Show tooltip group to enable measuring
                tooltipGroup.style.display = 'block';

                // Force a reflow to ensure text is measured correctly
                tooltipText.getBBox();

                // Now measure text to size background
                const bbox = tooltipText.getBBox();
                const padding = 6;
                tooltipRect.setAttribute('x', bbox.x - padding);
                tooltipRect.setAttribute('y', bbox.y - padding);
                tooltipRect.setAttribute('width', bbox.width + padding * 2);
                tooltipRect.setAttribute('height', bbox.height + padding * 2);
            });

            circle.addEventListener('mouseleave', function() {
                this.setAttribute('r', '4');
                this.setAttribute('fill', 'rgba(0, 123, 255, 1)');
                tooltipGroup.style.display = 'none';
            });

            svg.appendChild(circle);
        }

        // Draw labels
        for (let i = 0; i < axes; i++) {
            const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
            const labelRadius = maxRadius + 15;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', '#333');
            text.textContent = labels[i];
            svg.appendChild(text);
        }

        // Add tooltip last so it appears on top of all other elements
        svg.appendChild(tooltipGroup);

        return svg;
    }

    /**
     * Initialize sorting functionality
     */
    function initializeSorting() {
        const sortSelect = document.getElementById('sort-select');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', function () {
            updateDisplay();
        });
    }

    /**
     * Sort beers by selected criteria
     */
    function sortBeers(beerList, sortBy) {
        const sorted = [...beerList];

        switch (sortBy) {
            case 'maltiness':
            case 'colorDepth':
            case 'clarity':
            case 'bitterness':
            case 'otherAromas':
            case 'overall':
                return sorted.sort((a, b) => b.scores[sortBy] - a.scores[sortBy]);
            case 'abv':
                // Sort by ABV (alcohol percentage) - high to low
                return sorted.sort((a, b) => b.abv - a.abv);
            case 'price':
                // Sort beers with price > 0 first (by price ascending - low to high), then beers with price = 0
                return sorted.sort((a, b) => {
                    const aHasPrice = a.price > 0;
                    const bHasPrice = b.price > 0;

                    // If both have prices or both don't have prices, sort by price (ascending - low to high)
                    if (aHasPrice === bHasPrice) {
                        return a.price - b.price;
                    }

                    // Beers with price come before beers without price
                    return bHasPrice ? 1 : -1;
                });
            case 'date':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            default:
                return sorted;
        }
    }

    /**
     * Initialize image modal functionality
     */
    function initializeImageModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'beer-modal';
        modal.innerHTML = `
            <div class="beer-modal__overlay"></div>
            <div class="beer-modal__content">
                <button class="beer-modal__close" aria-label="Close">&times;</button>
                <img class="beer-modal__image" src="" alt="">
            </div>
        `;
        document.body.appendChild(modal);

        const overlay = modal.querySelector('.beer-modal__overlay');
        const closeBtn = modal.querySelector('.beer-modal__close');
        const modalImage = modal.querySelector('.beer-modal__image');

        // Close modal function
        function closeModal() {
            modal.classList.remove('beer-modal--active');
        }

        // Add event listeners for beer images
        document.addEventListener('click', function(e) {
            const clickedImage = e.target.closest('.beer-card__image');
            if (clickedImage) {
                modalImage.src = clickedImage.src;
                modalImage.alt = clickedImage.alt;
                modal.classList.add('beer-modal--active');
            }
        });

        // Close modal on overlay click or close button
        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('beer-modal--active')) {
                closeModal();
            }
        });
    }

    // Expose global function for AI assistant to filter beers by prediction
    window.filterBeersByPrediction = function(beerIds) {
        if (!beerIds || !Array.isArray(beerIds) || beerIds.length === 0) {
            console.warn('Invalid beer IDs for prediction filtering');
            return;
        }

        // Set filter to prediction type with beer IDs
        setFilter('prediction', beerIds);

        // Provide visual feedback
        console.log('AI prediction filter applied: showing ' + beerIds.length + ' beer(s)');

        // Flash the beer count to indicate filter is active
        const countElement = document.querySelector('.beer-gallery__count');
        if (countElement) {
            countElement.style.transition = 'background-color 0.3s ease';
            countElement.style.backgroundColor = '#48A999';
            countElement.style.color = 'white';
            countElement.style.padding = '2px 8px';
            countElement.style.borderRadius = '4px';

            // Reset style after animation
            setTimeout(() => {
                countElement.style.backgroundColor = '';
                countElement.style.color = '';
                countElement.style.padding = '';
                countElement.style.borderRadius = '';
            }, 2000);
        }
    };

    // Clear filter helper (can be called programmatically)
    window.clearBeerFilter = function() {
        if (activeFilter.type) {
            console.log('Clearing ' + activeFilter.type + ' filter');
            activeFilter = { type: null, value: null };
            renderStatisticsCharts();
            updateDisplay();
        }
    };

    // Admin hook: lets js/beer-admin.js mutate the data and trigger a full
    // re-render (gallery + statistics) after add/edit/delete without a page reload.
    window.__beerAPI = {
        getBeers: function () { return beers; },
        upsert: function (beer) {
            // Normalize imageUrl to the page-relative form beer.js expects
            if (beer.imageUrl && !beer.imageUrl.startsWith('../') && !/^https?:/.test(beer.imageUrl)) {
                beer = Object.assign({}, beer, { imageUrl: '../' + beer.imageUrl });
            }
            // Cache-bust the image so the new file is fetched (GitHub raw + Pages CDN)
            if (beer.imageUrl) {
                beer = Object.assign({}, beer, { imageUrl: beer.imageUrl + '?t=' + Date.now() });
            }
            const idx = beers.findIndex(function (b) { return b.id === beer.id; });
            if (idx >= 0) beers[idx] = beer;
            else beers.push(beer);
            renderStatisticsCharts();
            updateDisplay();
        },
        remove: function (id) {
            const idx = beers.findIndex(function (b) { return b.id === id; });
            if (idx < 0) return false;
            beers.splice(idx, 1);
            renderStatisticsCharts();
            updateDisplay();
            return true;
        },
    };

})();
