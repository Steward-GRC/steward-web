import EmEnDashPlugin from '../plugins/EmEnDashPlugin';
import HorizontalRulePlugin from '../plugins/HorizontalRulePlugin';
import ImagePlugin from '../plugins/ImagePlugin';
import {CalloutPlugin} from '../plugins/CalloutPlugin';
import {CardMenuPlugin} from '../plugins/CardMenuPlugin';
import {KoenigSnippetPlugin} from '../plugins/KoenigSnippetPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {TablePlugin} from '../../additions/table/TablePlugin';
import {TogglePlugin} from '../plugins/TogglePlugin';

export const AllDefaultPlugins = () => {
    return (
        <>
            {/* Lexical Plugins */}
            <ListPlugin /> {/* adds indent/outdent/remove etc support */}
            {/* <TabIndentationPlugin /> tab/shift+tab triggers indent/outdent */}

            {/* Koenig Plugins */}
            <CardMenuPlugin />
            <KoenigSnippetPlugin />

            {/* Card Plugins */}
            <ImagePlugin />
            <EmEnDashPlugin />
            <HorizontalRulePlugin />
            <CalloutPlugin />
            <TogglePlugin />
            <TablePlugin />
        </>
    );
};

export default AllDefaultPlugins;
