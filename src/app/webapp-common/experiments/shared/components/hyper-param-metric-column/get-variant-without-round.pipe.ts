import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'getVariantWithoutRound',
  standalone: true
})
export class GetVariantWithoutRoundPipe implements PipeTransform {

  transform(col, metrics): number {
    return metrics?.[col.metric_hash]?.[col.variant_hash]?.[col.valueType];
  }

}
