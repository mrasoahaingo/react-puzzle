import {shallow} from 'enzyme';
import expect from 'expect';
import React from 'react';
import describeWithDOM from 'describe-with-dom';

import { Motion } from 'react-motion';
import App from 'compo/App';

describeWithDOM('App component', () => {

    it('should say hello', () => {
        const component = shallow(<App />);
        expect(component.find(Motion).length).toEqual(16);
    });
});
