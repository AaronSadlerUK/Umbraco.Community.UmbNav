using System.Collections.Generic;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Abstractions;

public interface IUmbNavMenuBuilderService
{
    IEnumerable<UmbNavItem> BuildMenu(IEnumerable<UmbNavItem> items, int level = 0,
        bool removeNoopener = false, bool removeNoreferrer = false, bool includeChildNodes = false);
}
