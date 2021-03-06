import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    newSectionFilter,
    setQuery,
    fetchSectionFilters,
} from '../actions';
import SectionFilters from './SectionFilters';
import ListBar from 'components/ListBar';
import { gettext } from 'utils';

import SectionSwitch from 'features/sections/SectionSwitch';
import { sectionsPropType } from 'features/sections/types';

class SectionFiltersApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return [
            <ListBar key="bar"
                onNewItem={this.props.newSectionFilter}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchSectionFilters}
                buttonName={gettext('Section Filter')}
            >
                <SectionSwitch
                    sections={this.props.sections}
                    activeSection={this.props.activeSection}
                />
            </ListBar>,
            <SectionFilters
                key="sectionFilters"
                activeSection={this.props.activeSection}
                sections={this.props.sections} />
        ];
    }
}

SectionFiltersApp.propTypes = {
    sections: sectionsPropType,
    activeSection: PropTypes.string.isRequired,

    fetchProducts: PropTypes.func,
    setQuery: PropTypes.func,
    newSectionFilter: PropTypes.func,
    fetchSectionFilters: PropTypes.func,
};

const mapStateToProps = (state) => ({
    sections: state.sections.list,
    activeSection: state.sections.active,
});

const mapDispatchToProps = {
    fetchSectionFilters,
    setQuery,
    newSectionFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(SectionFiltersApp);
