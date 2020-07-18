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
