# Embedd

Embedd allows you to display reddit and/or HackerNews comments on your
website. The intended use case is for blogs and product pages,
although it is configurable enough for other cases.

All API queries happen in the browser so you don't have to rely on a
separate third party (other than reddit and HackerNews). I am hosting
the file at https://embedd.io/embedd.min.js but it will work just the
same if you download the code and host it yourself.

![example using the dark theme](https://embedd.io/embedd_example.png)

## Usage

You can get started right now by adding the following script tag to
your website.

``` html
<script src="https://embedd.io/embedd.min.js"></script>
```

The default behavior is to search reddit and HackerNews for all posts
that link to the URL of the current page. For each reddit and
HackerNews, if there are multiple threads with comments it will merge
them together in a single thread. If your post has been posted in both
places there will be a button to toggle between the views. It will
default to showing reddit comments first.

There are various configuration options you can set to alter the
behavior as stated above.

Here is an example with all possible configuration options set.

``` html
<script src="embedd.js">
	{
		"url": "https://www.eff.org/deeplinks/2015/10/closing-loopholes-europes-net-neutrality-compromise",
		"dark": true,
		"both": false,
		"service": "hn"
	} 
</script>
```

**url**: (default: current URL) The `url` option will use the URL
  that is passed as the search query for reddit and/or HackerNews.

**element**: (default: a new DOM element is created) The `element`
  option allows you to use a custom DOM element for containing the
  generated HTML. It accepts strings in the form of a query selector,
  e.g "#embeddSection" or ".commentSection .hnComments".

**dark**: (default: `false`) The `dark` option will enable the
  dark theme. This is optimal for sites with a dark background.

**both**: (default: `true`) The `both` option is for only
  displaying comments from a single service. If `service` is not set,
  setting this option will default to only display reddit comments.

**service**: (default: "reddit") The `service` option sets which
  service to display comments from on page load. Possible options are
  `"reddit"` and `"hn"`.

**limit**: (default: 5) The `limit` option sets how many top-level
  comments to display at a time. Setting `limit` to 0 will display all
  top-level comments.

**loadMore**: (default: `true`) The `loadMore` option toggles whether
  or not to display a "Load More" button. (works in conjunction with
  the `limit` option.)

**infiniteScroll**: (default: `false`) Setting this to `true` will
  enable infinite scrolling, where more comments will be loaded as you
  reach the end of the section. (works in conjunction with the `limit`
  option.)

**debug**: (default: `false`) Setting this to `true` will enable some
  useful data to log out to the console.

## Contributing

1. Fork it!

2. Create your feature branch: `git checkout -b my-new-feature`

3. Commit your changes: `git commit -am 'Add some feature'` (don't
forget to add tests!)

4. Push to the branch: `git push origin my-new-feature`

5. Submit a pull request :D

## Developing

To develop locally, first clone the repo

```
git clone git@github.com:tgallant/embedd.git
```

Then run `npm install` in the embedd directory to download all of the
dependencies.

To start up a local server run

```
npm run watch
```

Then browse to http://localhost:8080/webpack-dev-server/

The mocha tests will run automatically and the results will display in
the browser.

## Build

To build a minified version run

```
npm run build
```

The new build will be in the `dist/` directory.

## License

Copyright (c) 2015, Tim Gallant
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the
   distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
