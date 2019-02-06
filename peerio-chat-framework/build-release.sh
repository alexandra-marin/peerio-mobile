#!/bin/bash

xcodebuild -scheme peerio-chat-framework -project peerio-chat-framework.xcodeproj -configuration Release CONFIGURATION_BUILD_DIR=build/release HEADER_SEARCH_PATHS="$(pwd)/include" build
