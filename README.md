# Clock

It's a clock. It displays the time. Nothing else.

Well, it has basic theming support, which leverages the Web Storage APIs to store custom themes, but that's about it.

If you'd like to clean up the code for me, be my guest. If you'd like to add features, I don't mind that either. I'm reasonable relaxed when it comes to these kinds of things.

# Live Version

Thanks to the wonders of github.io, you can [see this in action](http://secretonline.github.io/Clock/). Amazing. (Boring.)

# Custom Themes

Note: Custom themes are currently only saved if your browser supports the Web Storage APIs. If you're using an updated browser, it probably already does.

There is a basic theme creation dialog available, which allows you to specify a text and background color.

For more advanced themes, the only way to add them is via JSON importing. The format is as follows

``` JSON
{
  "THEME_ID": {
    "name": "THEME_NAME",
    "font": "(optional) font_stack",
    "text": "TEXT_COLOR",
    "background": [
      "BACKGROUND_COLOR"
    ]
  }
}
```

If several colors are specified in the background color array, one will be picked depending on the time of day. i.e. at the middle of the day, the color in the middle of the array is chosen.
