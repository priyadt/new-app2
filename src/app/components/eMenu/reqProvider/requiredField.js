import React from 'react';
import { map } from 'lodash';

import Question from './question';
import Select from '../../common/select';
import ErrorMsg from '../../common/errormsg';

const RequireProvider = (props) => {
    const questiondata = props.data.Products;
    let checkprovideridList = [];
    let checkExistinCaption = [];
    let showCaption = false;
    return (
        <div className="row">
            {questiondata.length > 0 ?
                <div className="row rootborder">

                    {props.isEdit == false ? (<div className="col-xs-12 emenucol-head" style={{ padding: '10px' }}>
                        <span className="emenuHead">Required Provider Questions</span><strong style={{ float: 'right', cursor: 'pointer', textDecoration: 'underline', color: '#3f3fb5' }}
                            onClick={props.events.editEMenu}>Edit</strong>
                    </div>) :
                        (<section className="acc">
                            <p className="emenuHead">Required Provider Question</p>
                            {props.error &&
                                <ErrorMsg Caption="All fields are required" />
                            }
                            <div className="col-xs-12" style={{ marginLeft: '5px' }}>

                                {
                                    questiondata.map((category, idx) => {
                                        if (checkprovideridList.length <= 0 || checkprovideridList.indexOf(category.ProviderId) == -1) {
                                            checkprovideridList.push(category.ProviderId);
                                        }
                                        return (map(category.GroupedCategory, function (qs, catname) {
                                            return qs.map(function (q, i) {
                                                if (checkExistinCaption.length < 0 || checkExistinCaption.indexOf(q.Caption) == -1) {
                                                    checkExistinCaption.push(q.Caption);
                                                    showCaption = true;
                                                } else {
                                                    showCaption = false;
                                                }
                                                return (showCaption == true && (q.ControlType != 'NA' || (q.FieldValues !== undefined)) ?
                                                    (<Question error={props.error} key={category.ClientProductId.toString() + i + 'q'} categoryName={catname} clientproductId={category.ClientProductId} data={q} qId={i + 'q'} events={props.events} />) : null);
                                            });
                                        }));
                                    })
                                }
                                <button style={props.showTermRate ? {display: 'none'} : {}} className="btn-primary pull-right btn-req-provider" type="button" onClick={props.unhideTermRate}>Continue</button>
                            </div>
                        </section>)}
                </div> : null}
        </div>
    );
};

export default RequireProvider;
