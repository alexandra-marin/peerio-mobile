#!/bin/bash

set -e

rm -rf dist
mkdir dist
mkdir dist/debug
cp -r node_modules/\@workjam/react-native-chat-framework/ios/build/debug/* dist/debug/

source env.sh

./node_modules/.bin/react-native bundle --entry-file index.ios.js --bundle-output dist/debug/main.jsbundle --assets-dest "dist/debug" --platform ios --reset-cache

mkdir dist/release
cp -r node_modules/\@workjam/react-native-chat-framework/ios/build/release/* dist/release/

./node_modules/.bin/react-native bundle --dev false --entry-file index.ios.js --bundle-output dist/release/main.jsbundle --assets-dest "dist/release" --platform ios --reset-cache

mkdir dist/fonts
cp -r app/assets/fonts/* dist/fonts/
cp -r node_modules/react-native-vector-icons/Fonts/* dist/fonts/
chmod 644 dist/fonts/*

cp -r app/sounds dist/
