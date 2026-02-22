import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  standalone: true
})
export class SearchFilterPipe implements PipeTransform {

  // transform(items: any[], searchType: string, searchText: string): any[] {

  //   if (!items) return [];
  //   if (!searchType || !searchText) return items;

  //   searchText = searchText.toLowerCase();

  //   return items.filter(item => {
  //     const fieldValue = item[searchType];

  //     if (fieldValue === undefined || fieldValue === null) return false;

  //     return fieldValue.toString().toLowerCase().includes(searchText);
  //   });
  // }

  transform(items: any[], searchType: string, searchText: string): any[] {

    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    // 🔥 CASE 1 → Search all columns when dropdown empty
    if (!searchType) {
      return items.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchText)
      );
    }

    // 🔥 CASE 2 → Search specific column
    return items.filter(item => {
      const field = item[searchType];
      if (field === undefined || field === null) return false;

      return field.toString().toLowerCase().includes(searchText);
    });
  }

}
