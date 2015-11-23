# Embedd

Embedd allows you to display reddit and/or HackerNews comments on your
website. The intended use case is for blogs and product pages,
although it is configurable enough for other cases.

All API queries happen in the browser so you don't have to rely on a
separate third party (other than reddit and HackerNews). I am hosting
the file at https://embedd.io/embedd.min.js but it will work just the
same if you download the code and host it yourself.

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

**url**: (**Default**: current URL) The `url` option will use the URL
  that is passed as the search query for reddit and/or HackerNews.

**dark**: (**Default**: `false`) The `dark` option will enable the
  dark theme. This is optimal for sites with a dark background.

**both**: (**Default**: `true`) The `both` option is for only
  displaying comments from a single service. If `service` is not set,
  setting this option will default to only display reddit comments.

**service**: (**Default**: reddit) The `service` option sets which
  service to display comments from on page load. Possible options are
  `"reddit"` and `"hn"`.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

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
