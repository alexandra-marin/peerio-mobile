#!/bin/bash

xcodebuild -scheme peerio-chat-framework -project peerio-chat-framework.xcodeproj -configuration Debug CONFIGURATION_BUILD_DIR=build/debug HEADER_SEARCH_PATHS="$(pwd)/include" build
