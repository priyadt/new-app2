import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateProductRate, updateProductRateCost, updatePlanRate, updatePlanPrice, updateProductPackageInfo, updateProductPackagePrice } from '../../../actions/actions';
import { groupBy } from 'lodash';
import RatesOptions from './rateOptions';

function getSaveIndex(levels, userPrefernce, step) {
  let selectedProgram = 0;
  if (!userPrefernce) {
    return selectedProgram;
  }
  levels.map((level, index) => {
    switch (step) {
      case 'program':
        if (level.Desc == userPrefernce.program) {
          selectedProgram = index;
        }
        break;
      case 'coverage':
        if (level.Desc == userPrefernce.coverage) {
          selectedProgram = index;
        }
        break;
      case 'plan':
        if (level.Desc == userPrefernce.plan) {
          selectedProgram = index;
        }
        break;
    }
  });
  return selectedProgram;
}
function getRatesFromUserData(userPrefernce, state) {
  let packageRates = null;
  if (userPrefernce.program && userPrefernce.coverage && userPrefernce.plan) {
    packageRates = state.levelType3[state.planIndex] ? state.levelType3[state.planIndex].RateInfo : null;
  } else if (userPrefernce.program && userPrefernce.coverage) {
    packageRates = state.levelType2[state.coverageIndex] ? state.levelType2[state.coverageIndex].RateInfo : null;
  } else if (userPrefernce.program) {
    packageRates = state.levelType1[state.programIndex] ? state.levelType1[state.programIndex].RateInfo : null;
  }
  return packageRates;
}
function getUserSelectionTermMileage(userPrefernce, state) {
  let termMilageIndex = 0;
  const packageRates = getRatesFromUserData(userPrefernce, state);
  if (packageRates) {
    packageRates.Rates.map((rate, index) => {
      if (rate.TermMileage.Term == userPrefernce.term && rate.TermMileage.Mileage == userPrefernce.miles) {
        termMilageIndex = index;
      }
    });
  }
  return termMilageIndex;
}

function getLevels(Levels, userPrefernce) {
  const levelType1 = Levels;
  const levelType2 = (levelType1 && levelType1.length) ? levelType1[0].Levels : [];
  const levelType3 = (levelType2 && levelType2.length) ? levelType2[0].Levels : [];
  return {
    levelType1,
    levelType2,
    levelType3
  };
}
function getUpdatedLevels(Levels, userPrefernce) {
  const levelTyp1 = Levels;
  const levelTyp2 = (levelTyp1 && levelTyp1.length) ? levelTyp1[0].Levels : [];
  const levelTyp3 = (levelTyp2 && levelTyp2.length) ? levelTyp2[0].Levels : [];
  return {
    levelTyp1,
    levelTyp2,
    levelTyp3
  };
}
function getProductPackageKey(props) {
  const productId = props.product.id;
  const providerId = props.providerId;
  const productCode = props.productCode;
  const providerCode = props.providerCode;
  const packageType = props.plan;
  if(providerCode !== null)
  return `${productId}-${providerId}-${productCode}-${providerCode}-${packageType}`;
  else  return `${productId}-${providerId}-${productCode}-NR-${packageType}`;

}
function getProductRateKey(props) {
  let providerCode = (props.providerCode !==null) ? props.providerCode : 'NR'
  return `${props.product.id}-${props.providerId}-${props.productCode}-${providerCode}`;
}
function getUserPrefernceData(props) {
  let providerCode = (props.providerCode !==null) ? props.providerCode : 'NR'
  return `${props.product.id}-${props.providerName}-${providerCode}-${props.productCode}-${props.plan}`;
}
function getDeductibleAndTermMilageInfo(programs, userPlanPreference) {
  const {
    RateInfo
  } = programs;
  let indexInfo = {
    deductibleIndex: 0,
    termMilageIndex: 0,
    userPreferncedeductibleIndex: false
  };
  if (RateInfo && RateInfo.Rates) {
    RateInfo.Rates.map((rate, index) => {
      if (rate.Deductible.DeductAmt == userPlanPreference.deductible) {
        indexInfo.deductibleIndex = index;
      }
      if (rate.TermMileage.Term == userPlanPreference.Term) {
        indexInfo.termMilageIndex = index;
      }
    });
  }
  return indexInfo;
}

function closest(num, arr) {
    var curr = arr[0];
    var diff = Math.abs (num - curr);
    for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs (num - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
        }
    }
    return curr;
}

class ProductDetails extends Component {
  constructor(props) {
    super(props);
    const key = getProductRateKey(props);

    let providerRate = props.rateInfo.get(key);
    providerRate = (providerRate && providerRate.length) ? providerRate[0].Levels : null;
    const userPrefernce = props.userPrefernce.get(getUserPrefernceData(props));
    let {
      levelType1,
      levelType2,
      levelType3
    } = getLevels(providerRate, userPrefernce);

    let coverageIndex = 0;
    let programIndex = 0;
    let planIndex = 0;
    let termMilageIndex = 0;
    let deductibleIndex = 0;
    if (userPrefernce && props.product.is_rateable) {
      programIndex = getSaveIndex(levelType1, userPrefernce, 'program');
      levelType2 = levelType1.length ? levelType1[programIndex].Levels : [];
      coverageIndex = getSaveIndex(levelType2, userPrefernce, 'coverage');
      levelType3 = levelType2.length ? levelType2[coverageIndex].Levels : [];
      planIndex = getSaveIndex(levelType3, userPrefernce, 'plan');
    } else if (userPrefernce && !props.product.is_rateable) {
      let termArr = [];
      let { term, mileage } = this.getTermCombination(props.product.extension_data);
      term.map(t => {
        mileage.map(m => {
          termArr.push({
            term: t,
            mileage: m
          })
        })
      })
      termMilageIndex = termArr.findIndex(t => ((t.term == userPrefernce.term) && (t.mileage == userPrefernce.miles)))
       let termMileage = (termMilageIndex > -1) ? termMilageIndex : 0
      let count = 0;
      props.product.extension_data.map((e, i) => {
        if (e.option_name == "deductible") {
          if (userPrefernce.deductible == e.option_value) {
            deductibleIndex = count;
          }
          count++;
        }
      })
    }

    this.state = {
      rateIndex: 0,
      ...getLevels(providerRate, userPrefernce),
      programIndex,
      coverageIndex,
      planIndex,
      termMilageIndex,
      deductibleIndex,
      userPreferncedeductibleIndex: true,
      key,
      userPrefernce,
      RetailRate: {
        rate: 0
      },
      initialLoading: false,
      isDefaultAssigned : false,
      isDefaultUpdated : false,
      isPriceUpdated: false,
      isUserPriceAssigned: false,
      defCostUpdated: false,
      updateType: '',
      defaultAssignedValue : {} ,
      arrSelIndex: 0,
      isLevelSwitch: false,

    }
    this.getRateOptions = this.getRateOptions.bind(this);
  }

  prepareData() {
    if (!this.state.userPrefernce && this.props.product.is_rateable) {
        this.setState({})
    }
  }


  selectionEvent(priceObj, plan, options) {
    let RetailRate = this.state.RetailRate;
    if (!RetailRate.RetailRate) RetailRate.RetailRate = 0;
    if (priceObj.checked) {
      RetailRate.RetailRate += priceObj.price;
    } else {
      RetailRate.RetailRate -= priceObj.price;
    }
    RetailRate.OptionId = priceObj.OptionId;
    RetailRate.checked = priceObj.checked;
    this.setState({
      RetailRate,
    });
    let updatedOption = options.map(o => {
      if (o.OptionId == priceObj.OptionId) o.IsSelected = priceObj.checked
    })
    const cost = priceObj.checked ? priceObj.price : -priceObj.price;
    this.props.dispatch(updatePlanPrice(plan, { rate: RetailRate.RetailRate }, this.props.product.id))
    this.props.dispatch(updateProductRate(RetailRate.RetailRate, this.props.product.id));



    let { state, props } = this;
    const levelType1 = state.levelType1;
    const levelType2 = state.levelType2;
    const levelType3 = state.levelType3;
    const levels = [levelType1, levelType2, levelType3];
    const productPackageKey = getProductPackageKey(this.props);
    const productPackageInfo = this.props.productPackageInfo.get(productPackageKey);
    const termMileage = productPackageInfo.termMileage;
    const deductible = productPackageInfo.deductible;
    let providerCde = (this.props.providerCode !== null ? this.props.providerCode : 'NR')
    this.props.dispatch(updateProductPackageInfo(termMileage, deductible, options,
      this.state, this.props.product.id, this.props.providerId,
      this.props.productCode, providerCde, this.props.plan, cost, cost,
      false, this.props.providerName,
      true, this.props.initialLoadSuccess));

  }
  setLevel1 = (levels, index) => {
    const levelType1 = levels[index];
    const levelType2 = (levelType1 && levelType1.Levels) ? levelType1.Levels : null;
    const levelType3 = (levelType2 && levelType2.length) ? levelType2[0].Levels : null;
    this.setState({
      levelType1: levels,
      levelType2,
      levelType3,
      programIndex: index,
      isPriceUpdated: false,
      isDefaultAssigned: false,

    }, () => {
      this.updatePrice(this.state, this.props,'setLevel1', true);
    });
  }
  setLevel2 = (levels, index) => {
    const levelType2 = levels[index];
    const levelType3 = (levelType2 && levelType2.Levels) ? levelType2.Levels : null;
    this.setState({ levelType2: levels, levelType3, coverageIndex: index, isPriceUpdated: false,
    isDefaultAssigned: false}, () => {
      this.updatePrice(this.state, this.props, 'setLevel2',  true);
    });
  }
  setLevel3 = (levels, index) => {
    this.setState({ rateIndex: index, planIndex: index,isPriceUpdated: false,
    isDefaultAssigned: false}, () => {
      this.updatePrice(this.state, this.props,'setLevel3',  true);
    });

  }
  getRetailRate = (rate, plan, cost, termMilageIndex = 0, deductibleIndex = 0) => {
    let retailPrice = {
      error: false,
      errorMessage: '',
      RetailRate: 0,
      isDisabled: false,
      OptionId: 0,
      checked: false,
      min: 0,
      max: 0
    };
    const product = this.props.product;

    if (rate) {
      if (termMilageIndex > rate.length - 1) {
        termMilageIndex = 0;
      }
      let termMileage = this.getTermMileage(rate, termMilageIndex);
      rate = rate.filter(rate => rate.TermMileage.Term == termMileage.term && rate.TermMileage.Mileage == termMileage.mileage);
      if (deductibleIndex > rate.length - 1) {
        deductibleIndex = 0;
      }
      rate = rate[deductibleIndex];
      let RetailRate = rate.RetailRate < cost ? cost : rate.RetailRate;
      const RegulatedRuleId = rate.RegulatedRuleId;
      if (RegulatedRuleId != 3) {
        RetailRate = this.getCalucatedPrice(product, RetailRate);
      }
      retailPrice.min = rate.MinRetailRate;
      retailPrice.max = rate.MaxRetailRate;
      rate.Options.map(item => {
        if (item.IsSelected) {
          RetailRate += item.RetailRate;
        }
      })
      retailPrice.RetailRate = RetailRate;
      if (RegulatedRuleId) {
        const max = rate.MaxRetailRate;
        const min = rate.MinRetailRate;
        if (RegulatedRuleId === 5) {
          if (RetailRate < min || RetailRate > max) {
            retailPrice.error = true;
            retailPrice.errorMessage = `Price sholud be in the range of ${min}  and ${max}`;
          }
        }
        if (RegulatedRuleId === 3) {
          retailPrice.isDisabled = true;
        }
        if (RegulatedRuleId != 5 && RegulatedRuleId != 3) {
          const productMinPrice = product.min_price;
          const productMaxPrice = product.max_price;
          if (retailPrice.RetailRate < productMinPrice || retailPrice.RetailRate > productMaxPrice) {
            retailPrice.error = true;
            retailPrice.errorMessage = `Price should be in the range of ${productMinPrice}  and ${productMaxPrice}`;
          }
        }
      }
    }
    if (!product.is_rateable) {
      retailPrice.RetailRate = product.default_price;
      const productMinPrice = product.min_price;
      const productMaxPrice = product.max_price;
      if (retailPrice.RetailRate < productMinPrice || retailPrice.RetailRate > productMaxPrice) {
        retailPrice.error = true;
        retailPrice.errorMessage = `Price should be in the range of ${productMinPrice}  and ${productMaxPrice}`;
      }
    }
    this.state.RetailRate = retailPrice;
    return retailPrice;
  }
  getCalucatedPrice(product, cost) {
    const ParsedMarkUpAmt = parseInt(product.markup_amount);
    let markupAmount = isNaN(ParsedMarkUpAmt) ? 0 : ParsedMarkUpAmt;
    if (product.is_markup === 1) {
      if (markupAmount <= 0) {
        return cost;
      } else {
        markupAmount /= 100;
        return cost + (cost * markupAmount);
      }
    } else {
      return cost + markupAmount;
    }
  }

  levels = (levelType, keyType, fn, selectedIndex = 0) => {
    const isRateable = this.props.product.is_rateable;
    const name = this.props.name;
    if (isRateable && levelType && levelType.length) {
      if (selectedIndex > levelType.length - 1) {
        selectedIndex = 0
      }
      return (<div className="row r-small-bottom-margin" key={`${keyType}${this.props.product.id}${levelType[selectedIndex].Desc}`}>
        <p className="r-gray r-bottom-no-margin r-small-text">{levelType[0].LevelType}</p>
        <select value={levelType[selectedIndex].Desc} className="control-group" onChange={event => {
          fn(levelType, event.target.selectedIndex)
        }}>
          {levelType.map((item, i) => {
            return <option key={name + item.Desc + i}>{item.Desc}</option>
          })}
        </select>
      </div>);
    }
    return null;
  };

  getCost = (rate, termMilageIndex = 0, deductibleIndex = 0) => {
    let cost = 0;
    const isRateable = this.props.product.is_rateable;
    if (isRateable) {
      if (rate) {
        if (termMilageIndex > rate.length - 1) {
          termMilageIndex = 0;
        }
        let termMileage = this.getTermMileage(rate, termMilageIndex);
        let filteredrates = rate.filter(rate => rate.TermMileage.Term == termMileage.term && rate.TermMileage.Mileage == termMileage.mileage);
        if (deductibleIndex > filteredrates.length - 1) {
          deductibleIndex = 0;
        }
        cost = filteredrates[deductibleIndex].DealerCost;
        filteredrates[deductibleIndex].Options.map(item => {
          if (item.IsSelected) {
            cost += item.NetRate;
          }
        })
      }
    } else {
      cost = this.props.product.cost;
    }

    this.props.dispatch(updateProductRate(this.state.RetailRate.rate, this.props.product.id));
    this.props.dispatch(updateProductRateCost(this.props.product.id, cost));
    return cost;
  }

  getTermCombination = (extData) => {
    let len = extData.length;
    let term = [];
    let mileage = [];
    const termMilage = [];
    for (let i = 0; i < len; i++) {
      if (extData[i].option_name === 'term') {
        term.push(extData[i].option_value);
      }
      if (extData[i].option_name === 'miles') {
        mileage.push(extData[i].option_value);
      }
    }
    return { term, mileage };
  }


  getTerm = (rates, type, selectedOption) => {

    let userPrefernceTerm = this.state.userPrefernce ? this.state.userPrefernce.term : null;
    const name = this.props.name;
    const product = this.props.product;
    let defaultValue = {};
    if ((this.state.termMilageIndex == 0 || this.state.termMilageIndex > 0) && this.state.initialLoading && this.state.isDefaultUpdated) {
      defaultValue = {}
    } else if (userPrefernceTerm !== null) {
      defaultValue = {
        value: `${userPrefernceTerm} / ${this.state.userPrefernce.miles}`
      }
    }else if (this.state.isDefaultAssigned && !this.state.isDefaultUpdated) {
        defaultValue = this.state.defaultAssignedValue;
    }

    if (product.is_rateable) {
      if (!rates) {
        return null;
      }
      return (
        <div className="row r-small-bottom-margin">
          <p className="r-gray r-bottom-no-margin r-small-text">Term/Miles</p>
          <select {...defaultValue} className="control-group" onChange={event => {
            this.termMilageChangeEvent(event.target.selectedIndex, 'change',458)
          }}>
            {rates.map((item, i) => <option key={`${name}-${item.TermMileage.Term}-${item.TermMileage.Mileage}-${i}`}>{`${item.TermMileage.Term} / ${item.TermMileage.Mileage < 0 ? 999999 : item.TermMileage.Mileage}`}</option>)
            }
          </select>
        </div>
      );
    }
    const len = product.extension_data.length;
    const termMilage = [];
    let { term, mileage } = this.getTermCombination(product.extension_data);
    let options = [];
    term.map((item, i) => {
      mileage.map((miles, m) => {
        options.push(<option key={`${name}-${term[i]}-${mileage[m]}-${i}`}>{`${term[i]} / ${mileage[m]}`}</option>)
      })
    })
    return (
      <div className="row r-small-bottom-margin">
        <p className="r-gray r-bottom-no-margin r-small-text">Term/Miles</p>
        <select {...defaultValue} className="control-group" onChange={event => {
          this.termMilageChangeEvent(event.target.selectedIndex, 'change',479)
        }}>
          {options}
        </select>
      </div>);
  }
  getDeductibleAmount(rates) {
    const DeductAmt = groupBy(rates, (item) => {
      return item.Deductible ? item.Deductible.DeductAmt : null;
    });
    const Deductibles = Object.keys(DeductAmt);
    return Deductibles.filter(item => item != "null");
  }
  getDeductible = (rates, termMilageIndex) => {
    const product = this.props.product;
    if (product.is_rateable) {
      if (!rates) {
        return [];
      }
      if (termMilageIndex > rates.length - 1) {
        termMilageIndex = 0;
      }
      let termMileage = this.getTermMileage(rates, termMilageIndex);
      let filteredrates = rates.filter(rate => rate.TermMileage.Term == termMileage.term && rate.TermMileage.Mileage == termMileage.mileage);
      const amount = this.getDeductibleAmount(filteredrates);
      return (
        amount.map((item, i) => {
          return <option key={item + i} > {item} </option>
        })
      );
    }
    const len = product.extension_data.length;
    const deductible = [];
    for (let i = 0; i < len; i++) {
      if (product.extension_data[i].option_name === 'deductible') {
        deductible.push(<option key={`${product.extension_data[i].option_value}` + i} >
          {product.extension_data[i].option_value}
        </option>);
      }
    }
    return deductible;
  }
  getRateInfo = (levels) => {
    levels = levels.filter(level => level && level.length);
    if (levels) {
      return levels[levels.length - 1];
    }
  }
  getRates = (rateprops, rateIndex) => {
    if (rateprops && rateprops.length) {
      if (rateIndex > rateprops.length - 1) {
        rateIndex = 0;
      }
      return (rateprops[rateIndex].RateInfo ? rateprops[rateIndex].RateInfo.Rates : null);
    }
  }
  getRateOptions = (Rates, plan, rateIndex = 0) => {
    const isRateable = this.props.product.is_rateable;
    const options = [];
    if (isRateable) {
      if (rateIndex > Rates.length) {
        rateIndex = 0;
      }
      let self = this;
      Rates[rateIndex].Options.map((opt, i) => {
        let selected = this.state.RetailRate.OptionId === opt.OptionId ? this.state.RetailRate.checked : opt.IsSelected;
        if (this.state.userPrefernce) {
          this.state.userPrefernce.options.map((uo) => {
            if (uo.option_cd == opt.OptionDesc) {
              selected = uo.is_selected
            }
          })
        }
        options.push(
          <RatesOptions key={opt.OptionDesc + i}
            index={i}
            isSelected={selected}
            OptionDesc={opt.OptionDesc}
            IsSurcharge={opt.IsSurcharge}
            opt={opt}
            onSelect={event => this.selectionEvent(event, plan, Rates[0].Options)}
          />);
      });
      return (<div className="row r-small-bottom-margin">
        <p className="r-gray r-small-text">Options</p>
        {options.map(item => item)}
      </div>);
    }
    return null;
  }
  getTermMileage(rates, selectIndex) {
    if (!rates) {
      return null;
    }
    const selIndex = (selectIndex > -1 ) ? selectIndex : 0;
    const item = rates[selIndex];

    return {
      term: item.TermMileage.Term,
      mileage: item.TermMileage.Mileage,
      termId: item.TermMileage.TermId
    };
  }
  termMilageChangeEvent(selectIndex, typ, lineFrom ) {

    let newState = { termMilageIndex: selectIndex, initialLoading: true, updateType : typ, defCostUpdated: true};
    if(typ === 'change') newState.isDefaultUpdated = true;
    if(typ === 'eventChange') this.setState({isDefaultUpdated : true})
    if(lineFrom === 859 && !this.state.defCostUpdated ){
      this.setState(newState , () => {
        this.updatePrice(this.state, this.props,'termMilage-new', true, selectIndex, this.state.deductibleIndex);
      })
    }else if(lineFrom === 860 || lineFrom === 863 || lineFrom == 859){
      this.setState(newState , () => {
        this.updatePrice(this.state, this.props,'termMilage-level', true, selectIndex, this.state.deductibleIndex);
      })
    }
  else{

    this.setState(newState , () => {
      let userPrefInfo = false;
      if(this.state.userPrefernce){
      const deductible = this.state.userPrefernce.deductible;
      const cost = this.state.userPrefernce.cost;
      const price = this.state.userPrefernce.price;
      let userPrefInfo = {
        deductible,
        cost,
        price
      }
    }
      this.updatePrice(this.state, this.props,'termMilage', true, selectIndex, this.state.deductibleIndex, userPrefInfo);
    })
  }
  }
  deductibleChangeEvent(rates, selectIndex) {
    let { state, props } = this;
    const levelType1 = state.levelType1;
    const levelType2 = state.levelType2;
    const levelType3 = state.levelType3;
    const levels = [levelType1, levelType2, levelType3];
    const productPackageKey = getProductPackageKey(this.props);
    const productPackageInfo = this.props.productPackageInfo.get(productPackageKey);
    const termMileage = productPackageInfo.termMileage;
    const rateprops = this.getRateInfo(levels);
    const rate = this.getRates(rateprops, this.state.rateIndex);
    const deductible = (rate && props.product.is_rateable) ? this.getDeductibleAmount(rate)[selectIndex] : this.getDeductibleForNonRateableProduct(props.product.extension_data, selectIndex);

    this.props.dispatch(updateProductPackageInfo(termMileage, deductible, productPackageInfo.packageOption,
      this.state, this.props.product.id, this.props.providerId,
      this.props.productCode, this.props.providerCode, this.props.plan, 0, 0,
      false, this.props.providerName,
      true, this.props.initialLoadSuccess));
      this.setState({ deductibleIndex: selectIndex, userPreferncedeductibleIndex: false }, () => {
             this.updatePrice(this.state, this.props, 'deductibleChange',  true, this.state.termMilageIndex, selectIndex);
           });
  }
  getDeductibleForNonRateableProduct(ext, index) {
    if (ext && ext.length) {
      const len = ext.length;
      let arr = [];
      for (let i = 0; i < len; i++) {
        if (ext[i].option_name === 'deductible') {
          arr.push(ext[i].option_value);
        }
      }
      return arr[index];
    }
    return null;

  }
  getTermMileageForNonRateableProduct(extensionData, index) {
    if (extensionData && extensionData.length) {
      const termMileage = {
        "MaxTerm": 0,
        "Mileage": 0,
        "MinTerm": 0,
        "Term": 0,
        "TermId": 0
      };
      const term = [];
      const mileage = [];
      const termMilesArr = [];
      const len = extensionData.length;
      for (let i = 0; i < len; i++) {
        if (extensionData[i].option_name === 'term') {
          term.push(extensionData[i].option_value);
        }
        if (extensionData[i].option_name === 'miles') {
          mileage.push(extensionData[i].option_value);
        }
      }

      term.map(t => {
        mileage.map(m => {
          termMilesArr.push({
            "maxTerm": 0,
            "mileage": m,
            "minTerm": 0,
            "term": t,
            "termId": 0
          })
        })
      })

      return termMilesArr[index];
    }
    return null;
  }
  updatePrice = (state, props,from, levelChangePriceUpdate = false, termMilageIndex = 0, deductibleIndex = 0, userPrefernceInfo = false, initialLoad = false, initialLoadSuccess) => {
    return new Promise((resolve, reject) => {
      initialLoadSuccess = initialLoadSuccess ? initialLoadSuccess : props.initialLoadSuccess;
      const levelType1 = state.levelType1;
      const levelType2 = state.levelType2;
      const levelType3 = state.levelType3;
      const levels = [levelType1, levelType2, levelType3];
      const rateprops = (this.getRateInfo(levels)? this.getRateInfo(levels) : {});
      const rate = this.getRates(rateprops, this.state.rateIndex);

      const packageOption = props.product.is_rateable ? (rate && rate.length ? rate[0].Options : null) : null;

      let cost = userPrefernceInfo ? userPrefernceInfo.cost : this.getCost(rate, termMilageIndex, deductibleIndex);
      const termMileageNonRatableIndex = this.state.userPrefernce && this.state.initialLoading;
      const termMileage = props.product.is_rateable ? this.getTermMileage(rate, termMilageIndex) : this.getTermMileageForNonRateableProduct(props.product.extension_data, state.termMilageIndex);
      const deductible = userPrefernceInfo ? userPrefernceInfo.deductible : (rate && props.product.is_rateable) ? this.getDeductibleAmount(rate)[deductibleIndex] : this.getDeductibleForNonRateableProduct(props.product.extension_data, this.state.deductibleIndex);
      let price = {};

      if (!props.product.is_rateable) {
        price = userPrefernceInfo ? { RetailRate: userPrefernceInfo.price } : { RetailRate: props.product.default_price }
      } else {
        price = userPrefernceInfo ? { RetailRate: userPrefernceInfo.price } : this.getRetailRate(rate, props.plan, cost, termMilageIndex, deductibleIndex);
      }


      if(from == 'termMilage-new' || from == 'termMilage-level'){

        let deductibleArr = this.getDeductible(rate, state.termMilageIndex);
        let updatedDedArr = deductibleArr.map((item,i)=>item.props.children[1])
        deductibleIndex  =  state.userPrefernce ? ((updatedDedArr.indexOf(state.userPrefernce.deductible) > -1 ? updatedDedArr.indexOf(state.userPrefernce.deductible) : 0) ): 0 ;
        cost = this.state.userPrefernce ? this.state.userPrefernce.cost : this.getCost(rate, termMilageIndex, deductibleIndex);
      }

      if(!userPrefernceInfo && props.userPrefernce && state.userPrefernce && state.updateType != 'change' && !state.isUserPriceAssigned){
          const price1 = state.userPrefernce.price;
            const userPrefernceInfo = {
                price: price1
            };
        price = userPrefernceInfo &&  { RetailRate: userPrefernceInfo.price } ;

        this.setState({isUserPriceAssigned: true})

      }

      this.props.dispatch(updateProductPackageInfo(termMileage, deductible, packageOption, state, props.product.id, props.providerId, props.productCode, props.providerCode, props.plan, cost, price.RetailRate, levelChangePriceUpdate, props.providerName, initialLoad, initialLoadSuccess));
      resolve();
    })
  }
  getUpdatedUserPrefernceState(providerRate, props) {
    let newState = new Object(this.state); // Cloning into new object for Local mutation
    const key = `${props.product.id}-${props.providerName}-${props.providerCode}-${props.productCode}-${props.plan}`;
    const userPlanPreference = props.userPrefernce.get(key);
    if (userPlanPreference && providerRate.length) {
      let programs = providerRate[0].Levels;
      for (let i = 0; i < programs.length; i++) {
        if (programs[i].Desc === userPlanPreference.program) {
          newState.programIndex = i;
          programs = programs[i];
          break;
        }
      }
      if (programs && programs.Levels.length) {
        for (let i = 0; i < programs.Levels.length; i++) {
          if (programs.Levels[i].Desc === userPlanPreference.coverage) {
            newState.coverageIndex = i;
            programs = programs[i];
          }
        }
      }
      if (programs && programs.Levels.length) {
        for (let i = 0; i < programs.Levels.length; i++) {
          if (programs.Levels[i].Desc === userPlanPreference.plan) {
            newState.planIndex = i;
            programs = programs[i];
          }
        }
      }
      const { deductibleIndex, termMilageIndex } = getDeductibleAndTermMilageInfo(programs, userPlanPreference);
      newState.price = userPlanPreference.price;
      newState.cost = userPlanPreference.cost;
      newState.deductibleIndex = deductibleIndex;
      newState.termMilageIndex = termMilageIndex;
      newState.providerName = userPlanPreference.provider_name;

      return newState;
    }
    return null;
  }
  componentWillMount() {
    let selectedOption = '';
      if (this.props.termRateOptions.options.termrateoptions[0].term)
         selectedOption = this.props.termRateOptions.options.termrateoptions[0].term;


    if (this.state.userPrefernce && this.props.product.is_rateable) {

      const deductible = this.state.userPrefernce.deductible;
      const cost = this.state.userPrefernce.cost;
      const price = this.state.userPrefernce.price;
      let levelType2 = this.state.levelType1.length ? this.state.levelType1[this.state.programIndex].Levels : [];
      let levelType3 = levelType2.length ? levelType2[this.state.coverageIndex].Levels : [];
      this.setState({
        levelType2,
        levelType3
      }, () => {
        const termMilageIndex = getUserSelectionTermMileage(this.state.userPrefernce, this.state);
        const userPrefernceInfo = {
          deductible,
          cost,
          price
        };
        this.updatePrice(this.state, this.props, 'userPrefInfo1',true, termMilageIndex, 0, userPrefernceInfo, true, true);
      });
    }
    else {
      if(this.state.userPrefernce){
        const userPrefernceInfo2 = {
          deductible:this.state.userPrefernce.deductible,
          cost : this.state.userPrefernce.cost,
          price: this.state.userPrefernce.price
        };
        this.updatePrice(this.state, this.props,'userPrefInfo2', false, 0, 0, userPrefernceInfo2).then(() => {});
      }
      else
      this.updatePrice(this.state, this.props,'userPrefInfo3').then(() => {});


    }


  }

  updatePackagePrice(event, selectedKey) {
    let eveTarget = parseFloat(event.target.value);
    if(isNaN(eveTarget)) eveTarget = 0;
    if(this.refs.myPriceInput) this.refs.myPriceInput.value = eveTarget;

    this.setState({isPriceUpdated: true})
    setTimeout(()=>{
      this.props.dispatch(updateProductPackagePrice(selectedKey, eveTarget, this.props.product.id));
    }, 100)

  }

componentWillReceiveProps(nextProps) {

let userPrefernceTerm = this.state.userPrefernce ? this.state.userPrefernce.term : null;
if(!this.state.isPriceUpdated ){
  if( !this.state.isDefaultAssigned && !this.state.isDefaultUpdated ) {
    let newState = {};
    if(nextProps.providerSwitch){
    const productRateKey = getProductRateKey(nextProps);
    let productProviderRate = nextProps.rateInfo.get(productRateKey);
     productProviderRate = (productProviderRate && productProviderRate.length) ? productProviderRate[0].Levels : null;
     const productUserPref = nextProps.userPrefernce.get(getUserPrefernceData(nextProps));
    let {
      levelTyp1,
      levelTyp2,
      levelTyp3
    } = getUpdatedLevels(productProviderRate, productUserPref);
    newState ={ levelType1: levelTyp1, levelType2: levelTyp2, levelType3: levelTyp3 };
    nextProps.dispatch({type:'PROVIDER_SWITCH', providerSwitch: false})
  }

    this.setState({ newState }, () =>{

      const productPackageKey = getProductPackageKey(nextProps);
      const productPackageInfo = nextProps.productPackageInfo.get(productPackageKey);
      let levelType1 = this.state.levelType1 ? this.state.levelType1 : (productPackageInfo.levelType1 ? productPackageInfo.levelType1 : []);
      let levelType2 = this.state.levelType2 ? this.state.levelType2 : (productPackageInfo.levelType2 ? productPackageInfo.levelType2 : []);
      let levelType3 = this.state.levelType3 ? this.state.levelType3 : (productPackageInfo.levelType3 ? productPackageInfo.levelType3 : []);
      let rateprops = this.getRateInfo([levelType1, levelType2, levelType3]);
      const rates = (this.state.userPrefernce && this.props.product.is_rateable) ?
      getRatesFromUserData(this.state.userPrefernce, this.state).Rates
      :
      this.getRates(rateprops, productPackageInfo.rateIndex);

      let selectedOption = '';
      if (nextProps.termRateOptions.options.termrateoptions[0].term)
          selectedOption = nextProps.termRateOptions.options.termrateoptions[0].term;

    if ( selectedOption && !this.state.isDefaultAssigned && !this.state.isDefaultUpdated) {
      let milage = 999999;
      let terms = [], rateTermsListArr = [], rateTermsList = [];
      let dfVal = {}, defaultValue = {};
      if (rates && nextProps.product.is_rateable) {
          rates.map(function (rate, i) {
            if (rate.TermMileage.Term == selectedOption){
              terms.push(rate.TermMileage.Mileage / 1000);
              rateTermsListArr.push(rate.TermMileage.Mileage);
            }
          });

          rates.map(function (item, i) {
            let cObj = `${item.TermMileage.Term} / ${item.TermMileage.Mileage < 0 ? 999999 : item.TermMileage.Mileage}`
              rateTermsList.push(cObj);
          })
        if(this.props.financialInfo &&
              (this.props.financialInfo.finance_method == 'LEAS' || this.props.financialInfo.finance_method == 'BALL'  )){
                   let inYrs =  parseFloat(this.props.financialInfo.term / 12) ;
                   let totalAnnualMiles = parseInt(this.props.financialInfo.annual_miles * inYrs);
                   milage  = closest(totalAnnualMiles, rateTermsListArr);
        } else if (terms[0] > 0)
          milage = (closest(selectedOption, terms)) * 1000

        defaultValue = {
          value: `${selectedOption} / ${milage}`
        }
        dfVal =  defaultValue['value'] ;
        let arrSelIndex = rateTermsList.indexOf(dfVal)
         this.setState({isDefaultAssigned: true, defaultAssignedValue : defaultValue , arrSelIndex: arrSelIndex })

         if(userPrefernceTerm != null){
          let defaultValueT = {
             value: `${userPrefernceTerm} / ${this.state.userPrefernce.miles}`
           }
           let ddfVal =  defaultValueT['value'] ;
           let arrSelIndexT = rateTermsList.indexOf(ddfVal)
           if(arrSelIndexT > -1 ){
             this.termMilageChangeEvent(arrSelIndexT, 'event',859);
           }else  this.termMilageChangeEvent(0,'event',860);

         }else if(this.state.arrSelIndex > -1 && !this.state.isDefaultAssigned){
           this.termMilageChangeEvent(arrSelIndex, 'event',863);

        }else{
            let ddfVal2 =  defaultValue['value'] ;
            let arrSelIndex2 = rateTermsList.indexOf(ddfVal2)
            if(arrSelIndex2 > -1 ){
              this.termMilageChangeEvent(arrSelIndex2, 'event',870);
            }else  this.termMilageChangeEvent(0,'event',871);
        }

       }
       else if (!nextProps.product.is_rateable) {
         let milage = 999999;
         let terms = [], rateTermsList = [], milagesArr = [];
         let dfVal = {}, defaultValue = {};

         const len = nextProps.product.extension_data.length;
         const termMilage = [];
         let { term, mileage } = this.getTermCombination(nextProps.product.extension_data);
         let options = [];
         term.map((item, i) => {
           mileage.map((miles, m) => {
              if (term[i]== selectedOption)
              terms.push(term[i] )
           })

           mileage.map((miles, m) => {
             let cObj = `${term[i]} / ${mileage[m]}`
             rateTermsList.push(cObj);
             milagesArr.push(milage[m]);
           })
         })
         if(this.props.financialInfo &&
           (this.props.financialInfo.finance_method == 'LEAS' || this.props.financialInfo.finance_method == 'BALL'  )){
                let inYrs =  parseFloat(this.props.financialInfo.term / 12) ;
                let totalAnnualMiles = parseInt(this.props.financialInfo.annual_miles * inYrs);
                milage  = closest(totalAnnualMiles, mileage);
          } else if (terms[0] > 0)
           milage = (closest(selectedOption, terms)) * 1000


           defaultValue = {
             value: `${selectedOption} / ${milage}`
           }
           dfVal =  defaultValue['value'] ;
           let arrSelIndex = rateTermsList.indexOf(dfVal);

            this.setState({isDefaultAssigned: true, defaultAssignedValue : defaultValue , arrSelIndex: arrSelIndex })

            if(userPrefernceTerm != null){
             let defaultValueT = {
                value: `${userPrefernceTerm} / ${this.state.userPrefernce.miles}`
              }
              let ddfVal =  defaultValueT['value'] ;
              let arrSelIndexT = rateTermsList.indexOf(ddfVal)
              if(arrSelIndexT > -1 ){
                this.termMilageChangeEvent(arrSelIndexT, 'event',923);
              }else this.termMilageChangeEvent(0,'event',924);

            }
           else if(this.state.arrSelIndex > -1 && !this.state.isDefaultAssigned){
              this.termMilageChangeEvent(arrSelIndex, 'event',928);

           }else{
              this.termMilageChangeEvent(0,'event',931);
           }

      }


      }

   })
    }
  }


  }




  render() {
    const productPackageKey = getProductPackageKey(this.props);
    const productPackageInfo = this.props.productPackageInfo.get(productPackageKey);

    let rateInfoSize = 0;
    if (this.props.products.find(p => p.is_rateable) && this.props.rateInfo && !this.props.rateInfo.size) {
      rateInfoSize = 1;
    }
    if (rateInfoSize || !productPackageInfo) {
      return null;
    }

    let { props } = this;
    let selTermrateoptions = '';
    if (this.props.termRateOptions.options.termrateoptions[0].term)
      selTermrateoptions = this.props.termRateOptions.options.termrateoptions[0].term;

    const levelType1 = this.state.levelType1 ? this.state.levelType1 : (productPackageInfo.levelType1 ? productPackageInfo.levelType1 : []);
    const levelType2 = this.state.levelType2 ? this.state.levelType2 : (productPackageInfo.levelType2 ? productPackageInfo.levelType2 : []);
    const levelType3 = this.state.levelType ? this.state.levelType3 : (productPackageInfo.levelType3 ? productPackageInfo.levelType3 : []);
    const rateprops = this.getRateInfo([levelType1, levelType2, levelType3]);
    const rate = this.state.userPrefernce && this.props.product.is_rateable ? getRatesFromUserData(this.state.userPrefernce, this.state).Rates : this.getRates(rateprops, productPackageInfo.rateIndex);
    const termMilage = this.getTerm(rate, '', selTermrateoptions);
    const deductible = this.getDeductible(rate, this.state.termMilageIndex);
    const userSelectedDeductible = this.state.userPrefernce && this.state.userPreferncedeductibleIndex ? { value: this.state.userPrefernce.deductible } : {};
    const rateOptions = rate ? this.getRateOptions(rate, this.props.plan) : [];

    const cost = this.props.product.is_rateable ? productPackageInfo.cost : this.props.product.cost

    let price = productPackageInfo.price ? productPackageInfo.price : 0

    if(!isNaN(price)) {
        if(this.refs.myPriceInput) this.refs.myPriceInput.value = parseFloat(price);
      }
    else  {
      price = parseFloat(0);
      if(this.refs.myPriceInput) this.refs.myPriceInput.value = parseFloat(0);
    }

    let cls = null;
    if (!this.props.showMore) {
      cls = 'displayNone';
    }
    return (
      <div id="pkgrates" className={`span3 r-small-right-left-margin ${cls}`}>
        {productPackageInfo.cost ? <div className="rcorners">
          <div className="row r-small-bottom-margin-h"><b>{this.props.packageNames[this.props.name]}</b></div>
          {this.levels(levelType1, 'program', this.setLevel1, this.state.programIndex)}
          {this.levels(levelType2, 'coverage', this.setLevel2, this.state.coverageIndex)}
          {this.levels(levelType3, 'plan', this.setLevel3, this.state.planIndex)}
          {termMilage}
          {(!!deductible.length) &&
            <div className="row r-small-bottom-margin">
              <p className="r-gray r-bottom-no-margin r-small-text">Deductible</p>
              <select {...userSelectedDeductible} className="control-group" onChange={event => this.deductibleChangeEvent(rate, event.target.selectedIndex)}>
                {deductible.map(item => item)}
              </select>
            </div>}
          {rateOptions}
          <div className="row"><span className="prod-tot">Cost</span></div>
          <div className="row input-prepend input-append default-margin-tp-btm cus-input">
            <span className="add-on" id="sizing-addon2">$</span>
            <input value={cost} type="text" className="form-control" readOnly />
          </div>
          <div className="row"><span className="prod-tot">Price</span></div>
          <div className="row input-prepend input-append cus-input">
            <span className="add-on" id="sizing-addon2">$</span>
            <input key={productPackageInfo.cost} ref="myPriceInput" type="text"
            onChange={(event) => { this.updatePackagePrice(event, productPackageKey) }}
            className="form-control priceInp" value={price}/>
          </div>
          {productPackageInfo.priceUpdateError ?
            <div className="alert alert-danger fade in">
              {productPackageInfo.priceUpdateError}
            </div> : null
          }
        </div> :
          <div>  Sorry! No Rates to Display. Please try later.</div>
        }
      </div>
    );
  }
}

const mapStateToprops = state => ({
  rateInfo: state.rates.providerRate,
  userPrefernce: state.rates.userPrefernce,
  productPackageInfo: state.product.productPackageInfo,
  packageNames: state.packagesNames,
  termRateOptions: state.termRateOptions,
  initialLoadSuccess: state.product.initialLoadSuccess,
  products: state.product.list,
  financialInfo: state.financialInfo,
  providerSwitch: state.product.providerSwitch,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToprops, mapDispatchToProps)(ProductDetails);
