module.exports = config => ({
  type: "widget",
  icon: 'https://github.com/expo.png',
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.alsaifanalysis.com"
    ]
  },
});