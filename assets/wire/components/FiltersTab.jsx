import React from 'react';
import PropTypes from 'prop-types';

import { get, isEmpty } from 'lodash';
import { gettext } from 'utils';

import NavLink from './NavLink';
import NavGroup from './NavGroup';
import NavCreatedPicker from './NavCreatedPicker';

class FiltersTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {groups: [
            {
                field: 'service',
                label: gettext('Category'),
            },
            {
                field: 'subject',
                label: gettext('Subject'),
            },
            {
                field: 'genre',
                label: gettext('Genre'),
            },
            {
                field: 'urgency',
                label: gettext('News Value'),
            },
        ]};

        this.toggleGroup = this.toggleGroup.bind(this);
    }

    toggleGroup(event, group) {
        event.preventDefault();
        this.setState({groups: this.state.groups.map((_group) =>
            _group === group ? Object.assign({}, _group, {isOpen: !_group.isOpen}) : _group
        )});
    }

    render() {
        const LIMIT = 5;
        const {aggregations, activeFilter, createdFilter, toggleFilter} = this.props;
        const isResetActive = Object.keys(activeFilter).find((key) => !isEmpty(activeFilter[key]))
            || Object.keys(createdFilter).find((key) => !isEmpty(createdFilter[key]));
        return this.state.groups.map((group) => {
            const compareFunction = (a, b) => group.sorted ? -1 : String(a.key).localeCompare(String(b.key));
            const groupFilter = get(activeFilter, group.field, []);
            const buckets = get(aggregations[group.field], 'buckets', group.buckets)
                .sort(compareFunction)
                .map((bucket) => {
                    const isActive = groupFilter.indexOf(bucket.key) !== -1;
                    return (
                        <NavLink key={bucket.key}
                            isActive={isActive}
                            onClick={(event) => toggleFilter(event, group.field, bucket.key, group.single)}
                            label={bucket.label || '' + bucket.key}
                        />
                    );
                });

            if (!buckets.length) {
                return;
            }

            let visibleBuckets = buckets;
            if (buckets.length > LIMIT && !group.isOpen) {
                visibleBuckets = buckets.slice(0, LIMIT).concat([
                    <NavLink key={'more'} isActive={false} onClick={(event) => this.toggleGroup(event, group)} label={'...'} />
                ]);
            }

            return (
                <NavGroup key={group.field} label={group.label}>{visibleBuckets}</NavGroup>
            );
        }).filter((group) => !!group).concat([
            <NavCreatedPicker key="created" dispatch={this.props.dispatch} createdFilter={this.props.createdFilter} />,
            isResetActive ? (
                <div key="reset-buffer" id="reset-filter-buffer"></div>
            ) : null,
            isResetActive ? (
                <ResetFilter key="reset-filter" resetFilter={this.props.resetFilter} />
            ) : null,
        ]);
    }
}

FiltersTab.propTypes = {
    aggregations: PropTypes.object,
    activeFilter: PropTypes.object,
    toggleFilter: PropTypes.func.isRequired,
    resetFilter: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    createdFilter: PropTypes.object.isRequired,
};

function ResetFilter({resetFilter}) {
    return (
        <div id="reset-filter">
            <NavLink isActive={true} onClick={resetFilter} label={gettext('Clear filters')} />
        </div>
    );
}

ResetFilter.propTypes = {
    resetFilter: PropTypes.func.isRequired,
};

export default FiltersTab;
