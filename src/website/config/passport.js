const User = require('../../models/user'),
	fs = require('fs'),
	location = process.cwd() + '/src/website/files/userContent',
	LocalStrategy = require('passport-local').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	TwitterStrategy = require('passport-twitter').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	config = require('../../config').passport,
	bcrypt = require('bcrypt');

module.exports = function(passport) {
	// For just general login (username + email + password)
	passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
		try {
			// Check database for that email
			const user = await User.findOne({ email: email });
			if (!user) return done(null, false, { message:'Email not registered!' });
			if (!user.verified) return done(null, false, { message:'Please verify your email', ID: user._id });

			// Check if the password is correct
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Password incorrect!' });
				}
			});
		} catch (err) {
			console.log(err);
		}
	}));

	// For logging in via twitter
	passport.use(new TwitterStrategy({
		consumerKey: config.twitter.consumer_key,
		consumerSecret: config.twitter.consumer_secret,
		callbackURL: 	`${require('../../config').domain}/auth/twitter/callback`,
		passReqToCallback : true,
	}, function(req, token, tokenSecret, profile, done) {
		// asynchronous
		process.nextTick(function() {
			// check if the user is already logged in
			if (!req.user) {
				User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
					if (err) return done(err);
					if (user) {
						// if there is a user id already but no token (user was linked at one point and then removed)
						if (!user.twitter.token) {
							user.twitter.token = token;
							if (!user.avatar && profile.profile_image_url_https != 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png') user.avatar = profile.profile_image_url_https;
							user.save(function(err) {
								if (err) return done(err);
								return done(null, user);
							});
						}
						return done(null, user);
					} else {
						// if there is no user, create them
						const newUser = new User();
						newUser.name = profile.username ?? profile.displayName;
						newUser.twitter.id = profile.id;
						newUser.twitter.token = token;
						if (profile.profile_image_url_https != 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png') newUser.avatar = profile.profile_image_url_https;
						newUser.save(function(err) {
							if (err) return done(err);
							fs.mkdirSync(location + newUser._id);
							return done(null, newUser);
						});
					}
				});
			} else {
				// user already exists and is logged in, we have to link accounts
				const user = req.user;
				user.twitter.id = profile.id;
				user.twitter.token = token;
				if (!user.avatar && profile.profile_image_url_https != 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png') user.avatar = profile.profile_image_url_https;
				user.save(function(err) {
					if (err) return done(err);
					return done(null, user);
				});
			}
		});
	}));

	// facebook loggign in
	const fbStrategy = config.facebook;
	fbStrategy.passReqToCallback = true;
	passport.use(new FacebookStrategy(fbStrategy,
		function(req, token, refreshToken, profile, done) {
			// asynchronous
			process.nextTick(function() {
				// check if the user is already logged in
				if (!req.user) {
					User.findOne({ 'facebook.id': profile.id }, function(err, user) {
						if (err) return done(err);
						if (user) {
							// if there is a user id already but no token (user was linked at one point and then removed)
							if (!user.facebook.token) {
								user.facebook.token = token;
								user.facebook.email = (profile.emails[0].value || '').toLowerCase();
								if (!user.avatar && profile.profileUrl) user.avatar = profile.profileUrl;
								user.save(function(err) {
									if (err) return done(err);
									return done(null, user);
								});
							}
							return done(null, user);
						} else {
							// if there is no user, create them
							const newUser = new User();
							newUser.facebook.id = profile.id;
							newUser.facebook.token = token;
							newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
							newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
							if (profile.profileUrl) newUser.avatar = profile.profileUrl;
							newUser.save(function(err) {
								if (err) return done(err);
								fs.mkdirSync(location + newUser._id);
								return done(null, newUser);
							});
						}
					});
				} else {
					// user already exists and is logged in, we have to link accounts
					const user = req.user;
					user.facebook.id = profile.id;
					user.facebook.token = token;
					user.facebook.email = (profile.emails[0].value || '').toLowerCase();
					if (!user.avatar && profile.profileUrl) user.avatar = profile.profileUrl;
					user.save(function(err) {
						if (err) return done(err);
						return done(null, user);
					});
				}
			});
		}));

	// google
	passport.use(new GoogleStrategy({
		clientID: config.google.clientID,
		clientSecret: config.google.clientSecret,
		callbackURL: `${require('../../config').domain}/auth/google/callback`,
		passReqToCallback: true,
	}, function(req, token, refreshToken, profile, done) {
		// asynchronous
		process.nextTick(function() {
			// check if the user is already logged in
			if (!req.user) {
				User.findOne({ 'google.id' : profile.id }, function(err, user) {
					if (err) return done(err);
					if (user) {
						// if there is a user id already but no token (user was linked at one point and then removed)
						if (!user.google.token) {
							user.google.token = token;
							user.google.email = (profile.emails[0].value || '').toLowerCase();
							if (!user.avatar) user.avatar = profile.photos[0].value;
							user.save(function(err) {
								if (err) return done(err);
								return done(null, user);
							});
						}
						return done(null, user);
					} else {
						const newUser = new User();
						newUser.google.id = profile.id;
						newUser.google.token = token;
						newUser.name = profile.displayName;
						newUser.google.email = (profile.emails[0].value || '').toLowerCase();
						newUser.avatar = profile.photos[0].value;
						newUser.save(function(err) {
							if (err) return done(err);
							fs.mkdirSync(location + newUser._id);
							return done(null, newUser);
						});
					}
				});
			} else {
				// user already exists and is logged in, we have to link accounts
				const user = req.user;
				user.google.id = profile.id;
				user.google.token = token;
				user.google.email = (profile.emails[0].value || '').toLowerCase();
				if (!user.avatar) user.avatar = profile.photos[0].value;
				user.save(function(err) {
					if (err) return done(err);
					return done(null, user);
				});
			}
		});
	}));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});
};
