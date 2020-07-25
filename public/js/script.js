$(() => {
  const get2digits = (num) => {
    return ("0" + num).slice(-2);
  };

  const getDate = (dateObj) => {
    if (dateObj instanceof Date) {
      return (
        dateObj.getFullYear() +
        "-" +
        get2digits(dateObj.getMonth() + 1) +
        "-" +
        get2digits(dateObj.getDate())
      );
    }
  };

  const getTime = (dateObj) => {
    if (dateObj instanceof Date) {
      return (
        get2digits(dateObj.getHours()) +
        ":" +
        get2digits(dateObj.getMinutes()) +
        ":" +
        get2digits(dateObj.getSeconds())
      );
    }
  };

  const convertDate = () => {
    $("[data-date]").each((index, element) => {
      const dateString = $(element).data("date");
      if (dateString) {
        const date = new Date(dateString);
        $(element).html(getDate(date));
      }
    });
  };

  const convertDateTime = () => {
    $("[data-date-time]").each((index, element) => {
      const dateString = $(element).data("date-time");
      if (dateString) {
        const date = new Date(dateString);
        $(element).html(getDate(date) + " " + getTime(date));
      }
    });
  };

  convertDate();
  convertDateTime();
});

$(() => {
  let search = window.location.search;
  let params = {};

  if (search) {
    $.each(search.slice(1).split("&"), (eachIndex, param) => {
      let index = param.indexOf("=");

      if (index > 0) {
        let key = param.slice(0, index);
        let value = param.slice(index + 1);

        // key 에 해당하는 params 프로퍼티에 값이 없으면 value 할당.
        // 예를 들어 params[name] 에 값이 없으면 value 할당.
        // params[name] 은 params.name 이랑 같은 뜻이다.
        if (!params[key]) {
          params[key] = value;
        }
      }
    });
  }

  console.log(params);

  if (params.searchText && params.searchText.length >= 3) {
    $("[data-search-highlight]").each((eachIndex, element) => {
      console.log(element);
      let $element = $(element);

      // data-search-hightlight 에 들어있는 값 가져옴
      let searchHighlight = $element.data("search-highlight");
      let index = params.searchType.indexOf(searchHighlight);

      if (index >= 0) {
        let decodedSearchText = params.searchText.replace(/\+/g, " ");
        decodedSearchText = decodeURI(decodedSearchText);

        let regex = new RegExp(`(${decodedSearchText})`, "ig");
        console.log(regex);
        $element.html(
          $element.html().replace(regex, '<span class="highlighted">$1</span>')
        );
      }
    });
  }
});
