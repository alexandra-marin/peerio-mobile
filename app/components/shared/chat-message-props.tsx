import { Message, Chat } from '../../lib/peerio-icebear/models';

export interface ChatMessageProps {
    message?: Message;
    messageObject?: Message;
    chat?: Chat;
    onFileAction?: Function;
    onLegacyFileAction?: Function;
    onInlineImageAction?: Function;
    isClosed?: boolean;
    backgroundColor?: any;
    errorStyle?: any;
    onPressReceipt?: Function;
    folders?: string[];
}
