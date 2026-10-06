import DEFAULT_NODES from '../nodes/DefaultNodes';
import KoenigComposerContext from '../context/KoenigComposerContext';
import React from 'react';
import defaultTheme from '../themes/default';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import {DEFAULT_CONFIG} from '#kg-default-nodes';
import {KoenigSelectedCardContext} from '../context/KoenigSelectedCardContext';
import {LexicalCollaboration} from '@lexical/react/LexicalCollaborationContext';
import {LexicalComposer} from '@lexical/react/LexicalComposer';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function defaultOnError(error) {
    console.error(error);
}

const defaultConfig = {
    namespace: 'KoenigEditor',
    theme: defaultTheme,
    html: DEFAULT_CONFIG.html
};

// `collaboration` replaces upstream's built-in WebsocketProvider. The host supplies the Yjs
// provider factory (for the main document and for every nested editor), so the transport,
// credentials and room naming stay outside this package:
//
//   {
//     providerFactory(id, yjsDocMap) -> Provider,   // @lexical/yjs Provider
//     getNestedXmlText?(doc, id) -> XmlText,        // where a nested editor's content lives
//     username?, cursorColor?, cursorsContainerRef?, excludedProperties?, shouldBootstrap?
//   }
const KoenigComposer = ({
    initialEditorState,
    nodes = [...DEFAULT_NODES],
    onError = defaultOnError,
    fileUploader = {},
    cardConfig = {},
    darkMode = false,
    collaboration = null,
    editable = true,
    children
}) => {
    const initialConfig = React.useMemo(() => {
        let editorState = initialEditorState;

        // root needs to have at least one paragraph node for the editor to work
        if (editorState) {
            if (typeof editorState === 'string') {
                editorState = JSON.parse(editorState);
            }

            if (editorState.root?.children?.length === 0) {
                editorState.root.children.push({
                    children: [],
                    direction: null,
                    format: '',
                    indent: 0,
                    type: 'paragraph',
                    version: 1
                });
            }

            editorState = JSON.stringify(editorState);
        }

        return Object.assign({}, defaultConfig, {
            nodes,
            editable,
            editorState: collaboration ? null : editorState,
            onError
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Boolean(collaboration), initialEditorState, nodes, onError]);

    const editorContainerRef = React.useRef(null);

    if (!fileUploader.useFileUpload) {
        fileUploader.useFileUpload = function () {
            console.error('<KoenigComposer> requires a `fileUploader` prop object to be passed containing a `useFileUpload` custom hook');
            return;
        };
    }

    return (
        <LexicalCollaboration>
            <LexicalComposer initialConfig={initialConfig}>
                <KoenigComposerContext.Provider value={{
                    fileUploader,
                    editorContainerRef,
                    cardConfig,
                    darkMode,
                    collaboration
                }}>
                    <KoenigSelectedCardContext>
                        {collaboration ? (
                            <CollaborationPlugin
                                cursorColor={collaboration.cursorColor}
                                cursorsContainerRef={collaboration.cursorsContainerRef}
                                excludedProperties={collaboration.excludedProperties}
                                id="main"
                                initialEditorState={initialEditorState}
                                providerFactory={collaboration.providerFactory}
                                shouldBootstrap={collaboration.shouldBootstrap ?? true}
                                username={collaboration.username}
                            />
                        ) : null}
                        {children}
                    </KoenigSelectedCardContext>
                </KoenigComposerContext.Provider>
            </LexicalComposer>
        </LexicalCollaboration>
    );
};

export default KoenigComposer;
