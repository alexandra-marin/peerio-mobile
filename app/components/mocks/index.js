import MockBeacon from './beacons/mock-beacon';
import MockBeaconFiles from './beacons/mock-beacon-files';
import MockChannelView from './mock-channel-view';
import MockChannelCreate from './mock-channel-create';
import MockChatList from './mock-chat-list';
import MockTwoFactorAuth from './mock-two-factor-auth';
import Mock2FAPopup from './mock-2fa-popup';
import MockPopups from './mock-popups';
import MockStyledTextInput from './mock-styled-text-input';
import MockImagePreview from './mock-image-preview';
import MockThumbnail from './mock-thumbnail';
import MockActionSheet from './mock-action-sheet';
import MockSignupContactInvite from './mock-signup-contact-import';
import MockPerfResults from './mock-perf-results';
import MockSqlTest from './mock-sql-test';
import MockContactList from './mock-contact-list';
import MockImageError from './mock-image-error';
import MockMigration from './mock-migration';
import MockTopDrawer from './mock-top-drawer';
import MockUpgrade from './mock-upgrade';
import MockTestBridge from './mock-test-bridge';
import MockUrlPreview from './mock-url-preview';

// we require all mocks to prevent them from being orphaned
// when checking for unused JS filex
// eslint-disable-next-line
const mocks = {
    MockBeacon,
    MockBeaconFiles,
    MockChannelView,
    MockChannelCreate,
    MockChatList,
    MockTwoFactorAuth,
    Mock2FAPopup,
    MockPopups,
    MockStyledTextInput,
    MockImagePreview,
    MockThumbnail,
    MockActionSheet,
    MockSignupContactInvite,
    MockPerfResults,
    MockSqlTest,
    MockContactList,
    MockImageError,
    MockMigration,
    MockTopDrawer,
    MockUpgrade,
    MockTestBridge,
    MockUrlPreview
};

// switch this to mocks item to test [TODO: replace with storybooks]
export default null; // MockChannelView;
