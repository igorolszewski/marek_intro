
(function($) {

	skel.breakpoints({
		xlarge:		'(max-width: 1680px)',
		large:		'(max-width: 1280px)',
		medium:		'(max-width: 980px)',
		small:		'(max-width: 736px)',
		xsmall:		'(max-width: 480px)',
		xxsmall:	'(max-width: 360px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body'),
			$wrapper = $('#wrapper'),
			$header = $('#header'),
			$footer = $('#footer'),
			$main = $('#main'),
			$main_articles = $main.children('article');

		// no anim until page loads.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});


			$('form').placeholder();

	
			if (skel.vars.IEVersion < 12) {

				var flexboxFixTimeoutId;

				$window.on('resize.flexbox-fix', function() {

					clearTimeout(flexboxFixTimeoutId);

					flexboxFixTimeoutId = setTimeout(function() {

						if ($wrapper.prop('scrollHeight') > $window.height())
							$wrapper.css('height', 'auto');
						else
							$wrapper.css('height', '100vh');

					}, 250);

				}).triggerHandler('resize.flexbox-fix');

			}

		// navigation.
			var $nav = $header.children('nav'),
				$nav_li = $nav.find('li');

	
				if ($nav_li.length % 2 == 0) {

					$nav.addClass('use-middle');
					$nav_li.eq( ($nav_li.length / 2) ).addClass('is-middle');

				}

	
			var	delay = 325,
				locked = false;

			// methods.
				$main._show = function(id, initial) {

					var $article = $main_articles.filter('#' + id);

	
						if ($article.length == 0)
							return;

	
							if (locked || (typeof initial != 'undefined' && initial === true)) {

				
									$body.addClass('is-switching');

			
									$body.addClass('is-article-visible');

			
									$main_articles.removeClass('active');

		
									$header.hide();
									$footer.hide();

						
									$main.show();
									$article.show();

				
									$article.addClass('active');

				
									locked = false;

				
									setTimeout(function() {
										$body.removeClass('is-switching');
									}, (initial ? 1000 : 0));

								return;

							}

			
							locked = true;

		
						if ($body.hasClass('is-article-visible')) {

				
								var $currentArticle = $main_articles.filter('.active');

								$currentArticle.removeClass('active');

							// show article.
								setTimeout(function() {

									// hide article.
										$currentArticle.hide();

									// show article.
										$article.show();

									// activate article.
										setTimeout(function() {

											$article.addClass('active');

											// window stuff.
												$window
													.scrollTop(0)
													.triggerHandler('resize.flexbox-fix');

											// unlock.
												setTimeout(function() {
													locked = false;
												}, delay);

										}, 25);

								}, delay);

						}

					// otherwise, handle as normal.
						else {

							// mark as visible.
								$body
									.addClass('is-article-visible');

							// show article.
								setTimeout(function() {

									// hide header, footer.
										$header.hide();
										$footer.hide();

									// show main, article.
										$main.show();
										$article.show();

									// activate article.
										setTimeout(function() {

											$article.addClass('active');

											// window stuff.
												$window
													.scrollTop(0)
													.triggerHandler('resize.flexbox-fix');

											// unlock.
												setTimeout(function() {
													locked = false;
												}, delay);

										}, 25);

								}, delay);

						}

				};

				$main._hide = function(addState) {

					var $article = $main_articles.filter('.active');

					// article not visible? Bail.
						if (!$body.hasClass('is-article-visible'))
							return;

					// add state?
						if (typeof addState != 'undefined'
						&&	addState === true)
							history.pushState(null, null, '#');

					// handle lock.

						// Already locked? Speed through "hide" steps w/o delays.
							if (locked) {

								// Mark as switching.
									$body.addClass('is-switching');

								// Deactivate article.
									$article.removeClass('active');

								// Hide article, main.
									$article.hide();
									$main.hide();

								// Show footer, header.
									$footer.show();
									$header.show();

								// Unmark as visible.
									$body.removeClass('is-article-visible');

								// Unlock.
									locked = false;

								// Unmark as switching.
									$body.removeClass('is-switching');

								// Window stuff.
									$window
										.scrollTop(0)
										.triggerHandler('resize.flexbox-fix');

								return;

							}

						// Lock.
							locked = true;

					// Deactivate article.
						$article.removeClass('active');

					// Hide article.
						setTimeout(function() {

							// Hide article, main.
								$article.hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								setTimeout(function() {

									$body.removeClass('is-article-visible');

									// Window stuff.
										$window
											.scrollTop(0)
											.triggerHandler('resize.flexbox-fix');

									// Unlock.
										setTimeout(function() {
											locked = false;
										}, delay);

								}, 25);

						}, delay);


				};

			// Articles.
				$main_articles.each(function() {

					var $this = $(this);

					// Close.
						$('<div class="close">Close</div>')
							.appendTo($this)
							.on('click', function() {
								location.hash = '';
							});

					// Prevent clicks from inside article from bubbling.
						$this.on('click', function(event) {
							event.stopPropagation();
						});

				});

			// Events.
				$body.on('click', function(event) {

					// Article visible? Hide.
						if ($body.hasClass('is-article-visible'))
							$main._hide(true);

				});

				$window.on('keyup', function(event) {

					switch (event.keyCode) {

						case 27:

							// Article visible? Hide.
								if ($body.hasClass('is-article-visible'))
									$main._hide(true);

							break;

						default:
							break;

					}

				});

				$window.on('hashchange', function(event) {

					// Empty hash?
						if (location.hash == ''
						||	location.hash == '#') {

							// Prevent default.
								event.preventDefault();
								event.stopPropagation();

							// Hide.
								$main._hide();

						}

					// Otherwise, check for a matching article.
						else if ($main_articles.filter(location.hash).length > 0) {

							// Prevent default.
								event.preventDefault();
								event.stopPropagation();

							// Show article.
								$main._show(location.hash.substr(1));

						}

				});

			// Scroll restoration.
			// This prevents the page from scrolling back to the top on a hashchange.
				if ('scrollRestoration' in history)
					history.scrollRestoration = 'manual';
				else {

					var	oldScrollPos = 0,
						scrollPos = 0,
						$htmlbody = $('html,body');

					$window
						.on('scroll', function() {

							oldScrollPos = scrollPos;
							scrollPos = $htmlbody.scrollTop();

						})
						.on('hashchange', function() {
							$window.scrollTop(oldScrollPos);
						});

				}

			// Initialize.

				// Hide main, articles.
					$main.hide();
					$main_articles.hide();

				// Initial article.
					if (location.hash != ''
					&&	location.hash != '#')
						$window.on('load', function() {
							$main._show(location.hash.substr(1), true);
						});

	});

})(jQuery);