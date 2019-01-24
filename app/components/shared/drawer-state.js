import React from 'react';
import { action, observable, reaction } from 'mobx';
import uiState from '../layout/ui-state';
import routes from '../routes/routes';

// to identify our drawers
let lastDrawerId = 0;

/**
 * @typedef {Object} Drawer
 * @property {string} context where the drawer should show, contacts, chat list, etc ...
 * @property {component} component the React component, <TopDrawerMaintenance />, etc ...
 */
class DrawerState {
    @observable.shallow drawers = [];

    addDrawerTrigger(componentClass, context, propsParam, trigger, onDismiss) {
        reaction(
            trigger,
            value => {
                if (value) {
                    const drawerConfig = this.addDrawer(componentClass, context, propsParam);
                    drawerConfig.onDismiss = onDismiss;
                }
            },
            { fireImmediately: true }
        );
    }

    addDrawer(componentClass, context, propsParam) {
        lastDrawerId++;
        const props = propsParam || {};
        props.drawerId = lastDrawerId;
        const drawerConfig = {
            component: React.createElement(componentClass, props),
            context,
            drawerId: lastDrawerId
        };
        this.drawers.unshift(drawerConfig);
        return drawerConfig;
    }

    get globalDrawer() {
        return this.drawers.find(drawer => !drawer.context);
    }

    // TODO animate hiding drawer when keyboard is shown
    // Try to get Global drawer. Else try to get Local drawer in the given context
    // Otherwise return null
    getDrawer() {
        // hide drawers when keyboard is visible
        if (uiState.keyboardHeight) return null;
        return (
            this.globalDrawer || this.drawers.find(drawer => drawer.context === routes.main.route)
        );
    }

    // Try to dismiss top drawer in the specified context.
    // Otherwise dismiss global drawer.
    // Drawer is only removed after the animation is played
    @action.bound
    dismiss(drawerInstance) {
        const index = this.drawers.findIndex(
            drawer => drawer.drawerId === drawerInstance.props.drawerId
        );
        if (index !== -1) {
            const { onDismiss } = this.drawers[index];
            onDismiss && onDismiss();
            this.drawers.splice(index, 1);
        } else {
            console.error(`drawerState.dismiss: Could not find drawer component to dismiss`);
        }
    }

    @action.bound
    dismissAll() {
        this.drawers.clear();
    }
}

const drawerState = new DrawerState();
// global.drawerState = drawerState;
export default drawerState;
